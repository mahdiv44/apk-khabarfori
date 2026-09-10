import {Body,Controller,Get,Headers,Injectable,Post,UnauthorizedException,ServiceUnavailableException,BadRequestException} from '@nestjs/common';
import {Type} from 'class-transformer';
import {ArrayMaxSize,IsArray,IsBoolean,IsInt,IsISO8601,IsOptional,IsString,Max,MaxLength,Min,ValidateNested} from 'class-validator';
import {timingSafeEqual} from 'node:crypto';
import {Db} from './db';
import {Public} from './security';

export class TelegramItem {
 @IsInt() @Min(1) @Max(2147483647) id!:number;
 @IsString() @MaxLength(280) excerpt!:string;
 @IsISO8601() publishedAt!:string;
 @IsOptional() @IsInt() @Min(0) @Max(2147483647) reactions!:number|null;
 @IsOptional() @IsInt() @Min(0) @Max(2147483647) forwards!:number|null;
 @IsOptional() @IsInt() @Min(0) @Max(2147483647) views!:number|null;
}
export class TelegramSnapshot {
 @IsISO8601() capturedAt!:string;
 @IsBoolean() complete!:boolean;
 @IsInt() @Min(0) @Max(1000) scanned!:number;
 @IsInt() @Min(0) @Max(1000) missingMetrics!:number;
 @IsArray() @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>TelegramItem) items!:TelegramItem[];
}
export function rankTelegram(items:TelegramItem[],now=new Date()){
 const earliest=now.getTime()-86400000;
 const unique=new Map(items.map(item=>[item.id,item]));
 return [...unique.values()].filter(item=>{
  const date=Date.parse(item.publishedAt);
  return date>=earliest&&date<=now.getTime()&&Number.isInteger(item.reactions)&&Number.isInteger(item.forwards);
 }).map(item=>({...item,score:item.reactions!+item.forwards!,url:`https://t.me/AkhbareFori/${item.id}`}))
 .sort((a,b)=>b.score-a.score||Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||b.id-a.id).slice(0,50);
}
export function checkCollector(authorization:string|undefined,secret:string|undefined){
 if(!secret||secret.length<32)throw new ServiceUnavailableException('اتصال تلگرام پیکربندی نشده است.');
 const expected=Buffer.from(secret),given=Buffer.from(authorization||'');
 if(expected.length!==given.length||!timingSafeEqual(expected,given))throw new UnauthorizedException();
}
@Injectable()
export class TelegramService {
 constructor(private db:Db){}
 async read(){
  const row=await this.db.setting.findUnique({where:{key:'telegram:akhbarefori'}});
  if(!row)return {connected:false,items:[],message:'دریافت آمار تلگرام هنوز فعال نشده است.'};
  const snapshot=row.value as unknown as TelegramSnapshot;
  return {...snapshot,channel:'AkhbareFori',connected:true,stale:Date.now()-Date.parse(snapshot.capturedAt)>900000,windowHours:24,metric:'reactions+forwards',items:rankTelegram(snapshot.items)};
 }
 async ingest(body:TelegramSnapshot){
  const age=Date.now()-Date.parse(body.capturedAt);
  if(age< -60000||age>900000)throw new BadRequestException('زمان دریافت آمار معتبر نیست.');
  const value=JSON.parse(JSON.stringify({...body,items:rankTelegram(body.items,new Date(body.capturedAt))}));
  await this.db.setting.upsert({where:{key:'telegram:akhbarefori'},create:{key:'telegram:akhbarefori',value},update:{value}});
  return {ok:true};
 }
}
@Controller('social/telegram')
export class TelegramController {
 constructor(private telegram:TelegramService){}
 @Public() @Get('top') top(){return this.telegram.read()}
 @Public() @Post('snapshot') ingest(@Headers('x-khabarfori-collector') authorization:string,@Body() body:TelegramSnapshot){
  checkCollector(authorization,process.env.TELEGRAM_INGEST_TOKEN);
  return this.telegram.ingest(body);
 }
}
