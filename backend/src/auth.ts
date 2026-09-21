import {Controller,Post,Body,Req,Injectable,UnauthorizedException,BadRequestException,ConflictException,ServiceUnavailableException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Throttle} from '@nestjs/throttler';
import {compare,hash} from 'bcryptjs';
import {randomBytes,createHash} from 'node:crypto';
import {Db} from './db';import {Public,Principal} from './security';import {LoginDto,RegisterDto,RefreshDto,PasswordDto,ForgotDto,ResetDto} from './dto';import {identify,loginIdentity} from './policy';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
@Injectable()
export class AuthService{
 constructor(private db:Db,private jwt:JwtService){}
 identifier(s:string){try{return identify(s)}catch{throw new BadRequestException('ایمیل یا شماره همراه با کد کشور وارد کنید.')}}
 async tokens(user:{id:string;tokenVersion:number}){const refreshToken=randomBytes(48).toString('base64url');await this.db.refreshToken.create({data:{userId:user.id,hash:digest(refreshToken),expiresAt:new Date(Date.now()+30*86400000)}});return {accessToken:await this.jwt.signAsync({sub:user.id,ver:user.tokenVersion,type:'access'},{expiresIn:'15m',issuer:'khabarfori',audience:'khabarfori-clients'}),refreshToken,expiresIn:900}}
 async register(d:RegisterDto){const identifier=this.identifier(d.identifier);if(Buffer.byteLength(d.password)>72)throw new BadRequestException('رمز عبور بیش از حد طولانی است.');const role=await this.db.role.findUniqueOrThrow({where:{name:'NORMAL_USER'}});try{const user=await this.db.user.create({data:{...identifier,name:d.name,passwordHash:await hash(d.password,12),roles:{create:{roleId:role.id}}}});return this.tokens(user)}catch(e:any){if(e.code==='P2002')throw new ConflictException('این حساب قبلاً ثبت شده است.');throw e}}
 async login(d:LoginDto){let identity;try{identity=loginIdentity(d.identifier,process.env.ADMIN_EMAIL)}catch{throw new UnauthorizedException('اطلاعات ورود صحیح نیست.')}const user=await this.db.user.findFirst({where:identity});const fallback='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxEyL9DDdUGB/ozLd5lTr.G/.F.';const valid=await compare(d.password,user?.passwordHash||fallback);if(!user?.active||!valid)throw new UnauthorizedException('اطلاعات ورود صحیح نیست.');await this.db.user.update({where:{id:user.id},data:{lastActiveAt:new Date()}});return this.tokens(user)}
 async refresh(token:string){const result=await this.db.$transaction(async tx=>{const r=await tx.refreshToken.findUnique({where:{hash:digest(token)},include:{user:true}});if(!r||r.revokedAt||r.expiresAt<new Date()||!r.user.active)throw new UnauthorizedException();const consumed=await tx.refreshToken.updateMany({where:{id:r.id,revokedAt:null},data:{revokedAt:new Date()}});if(consumed.count!==1)throw new UnauthorizedException();return r.user});return this.tokens(result)}
 async change(user:Principal,d:PasswordDto){const u=await this.db.user.findUniqueOrThrow({where:{id:user.id}});if(!await compare(d.currentPassword,u.passwordHash))throw new UnauthorizedException('رمز فعلی صحیح نیست.');if(Buffer.byteLength(d.newPassword)>72)throw new BadRequestException();await this.db.$transaction([this.db.user.update({where:{id:user.id},data:{passwordHash:await hash(d.newPassword,12),tokenVersion:{increment:1}}}),this.db.refreshToken.updateMany({where:{userId:user.id,revokedAt:null},data:{revokedAt:new Date()}})]);return {ok:true}}
 async forgot(d:ForgotDto){if(!process.env.IDENTITY_DELIVERY_URL||!process.env.IDENTITY_DELIVERY_TOKEN)throw new ServiceUnavailableException('سرویس ارسال بازیابی رمز پیکربندی نشده است.');const user=await this.db.user.findFirst({where:this.identifier(d.identifier)});if(user){const token=randomBytes(32).toString('base64url');await this.db.passwordReset.create({data:{userId:user.id,hash:digest(token),expiresAt:new Date(Date.now()+15*60000)}});const r=await fetch(process.env.IDENTITY_DELIVERY_URL,{method:'POST',headers:{Authorization:'Bearer '+process.env.IDENTITY_DELIVERY_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({recipient:user.email||user.phone,template:'password-reset',token}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw new ServiceUnavailableException('ارسال انجام نشد.')}return {message:'اگر حساب وجود داشته باشد، راهنمای بازیابی ارسال می‌شود.'}}
 async reset(d:ResetDto){if(Buffer.byteLength(d.password)>72)throw new BadRequestException();const passwordHash=await hash(d.password,12);await this.db.$transaction(async tx=>{const r=await tx.passwordReset.findUnique({where:{hash:digest(d.token)}});if(!r||r.usedAt||r.expiresAt<new Date())throw new BadRequestException('پیوند معتبر نیست.');const consumed=await tx.passwordReset.updateMany({where:{id:r.id,usedAt:null},data:{usedAt:new Date()}});if(consumed.count!==1)throw new BadRequestException();await tx.user.update({where:{id:r.userId},data:{passwordHash,tokenVersion:{increment:1}}});await tx.refreshToken.updateMany({where:{userId:r.userId,revokedAt:null},data:{revokedAt:new Date()}})});return {ok:true}}
}
@Controller('auth')
@Throttle({default:{limit:10,ttl:60000}})
export class AuthController{
 constructor(private auth:AuthService,private db:Db){}
 @Public() @Post('register') register(@Body() d:RegisterDto){return this.auth.register(d)}
 @Public() @Post('login') login(@Body() d:LoginDto){return this.auth.login(d)}
 @Public() @Post('refresh') refresh(@Body() d:RefreshDto){return this.auth.refresh(d.refreshToken)}
 @Post('password') password(@Req() req:any,@Body() d:PasswordDto){return this.auth.change(req.user,d)}
 @Public() @Post('forgot-password') forgot(@Body() d:ForgotDto){return this.auth.forgot(d)}
 @Public() @Post('reset-password') reset(@Body() d:ResetDto){return this.auth.reset(d)}
 @Post('logout') async logout(@Req() req:any){await this.db.$transaction([this.db.user.update({where:{id:req.user.id},data:{tokenVersion:{increment:1}}}),this.db.refreshToken.updateMany({where:{userId:req.user.id,revokedAt:null},data:{revokedAt:new Date()}})]);return {ok:true}}
}
