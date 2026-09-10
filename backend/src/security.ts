import {CanActivate,ExecutionContext,Injectable,SetMetadata,UnauthorizedException,ForbiddenException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {JwtService} from '@nestjs/jwt';
import {Db} from './db';
import {hasPermission} from './policy';
export const Public=()=>SetMetadata('public',true);
export const Permit=(permission:string)=>SetMetadata('permission',permission);
export type Principal={id:string;name:string;email:string|null;roles:string[];permissions:string[];tokenVersion:number};
@Injectable()
export class AccessGuard implements CanActivate{
 constructor(private reflector:Reflector,private jwt:JwtService,private db:Db){}
 async canActivate(context:ExecutionContext){const req=context.switchToHttp().getRequest();const pub=this.reflector.getAllAndOverride<boolean>('public',[context.getHandler(),context.getClass()]);const auth=req.headers.authorization;
 if(auth){try{const claims=await this.jwt.verifyAsync(auth.replace(/^Bearer /,''),{issuer:'khabarfori',audience:'khabarfori-clients',algorithms:['HS256']});if(claims.type!=='access')throw Error();const user=await this.db.user.findUnique({where:{id:claims.sub},include:{roles:{include:{role:{include:{permissions:{include:{permission:true}}}}}}}});if(!user?.active||user.tokenVersion!==claims.ver)throw Error();req.user={id:user.id,name:user.name,email:user.email,tokenVersion:user.tokenVersion,roles:user.roles.map(r=>r.role.name),permissions:user.roles.flatMap(r=>r.role.permissions.map(p=>p.permission.name))} satisfies Principal;}catch{throw new UnauthorizedException('نشست معتبر نیست؛ دوباره وارد شوید.')}}
 if(!req.user&&!pub)throw new UnauthorizedException('ابتدا وارد حساب شوید.');const required=this.reflector.getAllAndOverride<string>('permission',[context.getHandler(),context.getClass()]);if(required&&(!req.user||!hasPermission(req.user.permissions,required)))throw new ForbiddenException('دسترسی کافی ندارید.');return true;
 }
}
