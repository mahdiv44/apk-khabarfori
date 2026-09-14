import {IsString,MinLength,MaxLength,IsOptional,IsEmail,IsIn,IsBoolean,IsArray,ArrayMaxSize,IsUrl,IsISO8601,Matches,IsInt,Min} from 'class-validator';
export class LoginDto{@IsString() @MaxLength(254) identifier!:string;@IsString() @MinLength(12) @MaxLength(72) password!:string}
export class RegisterDto extends LoginDto{@IsString() @MinLength(2) @MaxLength(100) name!:string}
export class RefreshDto{@IsString() @MaxLength(300) refreshToken!:string}
export class PasswordDto{@IsString() @MaxLength(72) currentPassword!:string;@IsString() @MinLength(12) @MaxLength(72) newPassword!:string}
export class ForgotDto{@IsString() @MaxLength(254) identifier!:string}
export class ResetDto{@IsString() @MaxLength(300) token!:string;@IsString() @MinLength(12) @MaxLength(72) password!:string}
export class ProfileDto{@IsString() @MinLength(2) @MaxLength(100) name!:string}
export class NewsDto{
 @IsString() @MinLength(3) @MaxLength(200) title!:string;
 @IsString() @MinLength(3) @MaxLength(500) description!:string;
 @IsString() @MinLength(3) @MaxLength(100000) content!:string;
 @IsString() @IsIn(['سیاست','اقتصاد','جامعه','فناوری','بین‌الملل','فرهنگ']) category!:string;
 @IsIn(['DRAFT','REVIEW','PUBLISHED']) status!:'DRAFT'|'REVIEW'|'PUBLISHED';
 @IsBoolean() vip!:boolean;
 @IsArray() @ArrayMaxSize(20) @IsString({each:true}) @MaxLength(60,{each:true}) tags!:string[];
 @IsOptional() @IsIn(['NEWS','EXPERT_OPINION','EDITOR_NOTE','EXCLUSIVE']) kind?:'NEWS'|'EXPERT_OPINION'|'EDITOR_NOTE'|'EXCLUSIVE';
 @IsOptional() @IsUrl({protocols:['https'],require_protocol:true}) coverImage?:string;
}
export class MessageDto{@IsString() @MinLength(3) @MaxLength(200) subject!:string;@IsString() @MinLength(3) @MaxLength(10000) body!:string;@IsIn(['MESSAGE','IDEA','REPORT','REVIEW']) type!:string}
export class ReplyDto{@IsString() @MaxLength(10000) reply!:string;@IsIn(['NEW','REVIEWING','COMPLETED']) status!:'NEW'|'REVIEWING'|'COMPLETED'}
export class EmployeeDto{@IsString() @MinLength(2) @MaxLength(100) fullName!:string;@IsString() @MinLength(2) @MaxLength(100) position!:string;@IsIn(['مدیریت','تحریریه','خبرنگاری','روابط عمومی','فنی','پشتیبانی']) department!:string;@IsString() @MaxLength(2000) biography!:string;@IsEmail() email!:string;@IsOptional() @IsString() @MaxLength(30) phone?:string;@IsOptional() @IsString() @MaxLength(30) employeeCode?:string;@IsOptional() @IsISO8601() employmentDate?:string;@IsOptional() @IsIn(['ACTIVE','INACTIVE','ON_LEAVE']) status?:string}
export class SalaryUnlockDto{@IsString() @MinLength(8) @MaxLength(72) password!:string}
export class SalaryRecordDto{@IsString() @Matches(/^\d{4}-(0[1-9]|1[0-2])$/) period!:string;@IsInt() @Min(0) grossAmount!:number;@IsInt() @Min(0) netAmount!:number;@IsOptional() @IsString() @MaxLength(1000) notes?:string}
export class RoleDto{@IsArray() @ArrayMaxSize(6) @IsIn(['SUPER_ADMIN','HOLDING_MANAGER','EDITOR_IN_CHIEF','EMPLOYEE','VIP_SUBSCRIBER','NORMAL_USER'],{each:true}) roles!:string[]}
export class CheckoutDto{@IsIn(['monthly','quarterly','yearly']) planId!:string}
export class CommentDto{@IsString() @MinLength(1) @MaxLength(2000) body!:string}
export class DeviceDto{@IsString() @MinLength(20) @MaxLength(4096) token!:string}
