import {Injectable,Controller,Post,Get,Delete,Param,Body,Req,Headers,UnauthorizedException,BadRequestException,ServiceUnavailableException} from '@nestjs/common';
import {Throttle} from '@nestjs/throttler';
import {JwtService} from '@nestjs/jwt';
import {compare} from 'bcryptjs';
import {IsObject,IsString,MaxLength} from 'class-validator';
import {generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse} from '@simplewebauthn/server';
import {Db} from './db';
import {Principal} from './security';
class CredentialDto {@IsObject() response!:any;}
@Injectable()
export class SalaryAccess {
 constructor(private db:Db,private jwt:JwtService){}
 async profile(user:Principal){const e=await this.db.employee.findUnique({where:{userId:user.id},include:{salaryProfile:true}});if(!e||e.status!=='ACTIVE')throw new UnauthorizedException('مدیر باید حساب شما را به پرونده پرسنلی فعال متصل کند.');return e.salaryProfile||this.db.salaryProfile.upsert({where:{employeeId:e.id},create:{employeeId:e.id},update:{}})}
 async issue(user:Principal,expectedVersion?:number){const p=await this.profile(user);if(expectedVersion!==undefined&&p.version!==expectedVersion)throw new UnauthorizedException();return {unlocked:true,expiresIn:300,salaryToken:await this.jwt.signAsync({sub:user.id,ver:user.tokenVersion,profile:p.id,pv:p.version,type:'salary'},{expiresIn:'5m',issuer:'khabarfori',audience:'khabarfori-salary'})}}
 async unlock(user:Principal,password:string){
  if(Buffer.byteLength(password)>72)throw new BadRequestException();
  const p=await this.profile(user);
  // Serialize password attempts so concurrent requests cannot bypass the lockout.
  const valid=await this.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT id FROM salary_profiles WHERE id=${p.id}::uuid FOR UPDATE`;
   const current=await tx.salaryProfile.findUniqueOrThrow({where:{id:p.id}});
   if(current.lockedUntil&&current.lockedUntil>new Date())return false;
   const account=await tx.user.findUniqueOrThrow({where:{id:user.id}});
   const ok=account.active&&account.tokenVersion===user.tokenVersion&&await compare(password,account.passwordHash);
   const attempts=current.lockedUntil?1:current.failedAttempts+1;
   await tx.salaryProfile.update({where:{id:p.id},data:{failedAttempts:ok?0:attempts,lockedUntil:!ok&&attempts>=5?new Date(Date.now()+900000):null}});
   return ok;
  });
  if(!valid)throw new UnauthorizedException('رمز حساب نادرست است یا دسترسی موقتاً قفل شده است.');
  return this.issue(user,p.version);
 }
 async verify(user:Principal,token:string){try{const c=await this.jwt.verifyAsync(token,{algorithms:['HS256'],issuer:'khabarfori',audience:'khabarfori-salary'});const p=await this.profile(user);if(c.type!=='salary'||c.sub!==user.id||c.ver!==user.tokenVersion||c.profile!==p.id||c.pv!==p.version)throw Error();return p}catch{throw new UnauthorizedException('برای دیدن فیش، قفل حقوق را باز کنید.')}}
}
@Controller('salary/passkeys')
@Throttle({default:{limit:10,ttl:60000}})
export class PasskeyController {
 constructor(private db:Db,private salary:SalaryAccess){}
 config(){const origin=process.env.WEBAUTHN_ORIGIN;const rpID=process.env.WEBAUTHN_RP_ID;if(!origin||!rpID||new URL(origin).hostname!==rpID||!origin.startsWith('https://'))throw new ServiceUnavailableException('دامنه HTTPS برای اثرانگشت پیکربندی نشده است.');return {origin,rpID}}
 async challenge(userId:string,kind:string,challenge:string){const key=`webauthn:${kind}:${userId}`;const value={challenge,expires:Date.now()+300000};await this.db.setting.upsert({where:{key},create:{key,value},update:{value}})}
 async consume(userId:string,kind:string){const key=`webauthn:${kind}:${userId}`;return this.db.$transaction(async tx=>{await tx.$queryRaw`SELECT key FROM settings WHERE key=${key} FOR UPDATE`;const row=await tx.setting.findUnique({where:{key}});if(!row)throw new UnauthorizedException();await tx.setting.delete({where:{key}});const v=row.value as any;if(v.expires<Date.now())throw new UnauthorizedException();return v.challenge as string})}
 @Get() list(@Req() r:any){return this.db.passkey.findMany({where:{userId:r.user.id},select:{id:true,createdAt:true}})}
 @Delete(':id') async remove(@Req() r:any,@Param('id') id:string,@Headers('x-salary-token') token:string){await this.salary.verify(r.user,token);await this.db.passkey.deleteMany({where:{id,userId:r.user.id}});return {ok:true}}
 @Post('register/options') async registerOptions(@Req() r:any,@Headers('x-salary-token') token:string){await this.salary.verify(r.user,token);const {rpID}=this.config();const prior=await this.db.passkey.findMany({where:{userId:r.user.id}});if(prior.length>=10)throw new BadRequestException('حداکثر ده کلید مجاز است.');const options=await generateRegistrationOptions({rpName:'خبرفوری',rpID,userName:r.user.id,userID:new TextEncoder().encode(r.user.id),excludeCredentials:prior.map(x=>({id:x.id})),authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'preferred',userVerification:'required'}});await this.challenge(r.user.id,'register',options.challenge);return options}
 @Post('register/verify') async registerVerify(@Req() r:any,@Body() d:CredentialDto,@Headers('x-salary-token') token:string){await this.salary.verify(r.user,token);const {origin,rpID}=this.config();const expectedChallenge=await this.consume(r.user.id,'register');let result;try{result=await verifyRegistrationResponse({response:d.response,expectedChallenge,expectedOrigin:origin,expectedRPID:rpID,requireUserVerification:true})}catch{throw new BadRequestException('تایید کلید دستگاه ناموفق بود.')}if(!result.verified)throw new UnauthorizedException();const c=result.registrationInfo.credential;await this.db.passkey.create({data:{id:c.id,userId:r.user.id,publicKey:Buffer.from(c.publicKey),counter:BigInt(c.counter),transports:c.transports||[]}});return {ok:true}}
 @Post('unlock/options') async unlockOptions(@Req() r:any){await this.salary.profile(r.user);const {rpID}=this.config();const keys=await this.db.passkey.findMany({where:{userId:r.user.id}});if(!keys.length)throw new BadRequestException('ابتدا با رمز، کلید دستگاه را ثبت کنید.');const options=await generateAuthenticationOptions({rpID,allowCredentials:keys.map(k=>({id:k.id})),userVerification:'required'});await this.challenge(r.user.id,'unlock',options.challenge);return options}
 @Post('unlock/verify') async unlockVerify(@Req() r:any,@Body() d:CredentialDto){const {origin,rpID}=this.config();const expectedChallenge=await this.consume(r.user.id,'unlock');const key=await this.db.passkey.findFirst({where:{id:String(d.response.id),userId:r.user.id}});if(!key)throw new UnauthorizedException();let result;try{result=await verifyAuthenticationResponse({response:d.response,expectedChallenge,expectedOrigin:origin,expectedRPID:rpID,credential:{id:key.id,publicKey:new Uint8Array(key.publicKey),counter:Number(key.counter)},requireUserVerification:true})}catch{throw new UnauthorizedException('تایید دستگاه ناموفق بود.')}if(!result.verified)throw new UnauthorizedException();const changed=await this.db.passkey.updateMany({where:{id:key.id,counter:key.counter},data:{counter:BigInt(result.authenticationInfo.newCounter)}});if(changed.count!==1)throw new UnauthorizedException();return this.salary.issue(r.user)}
}
