import {Controller,Get,Post,Patch,Body,Req,Param,ParseUUIDPipe,BadRequestException,Injectable,OnModuleInit,OnModuleDestroy,Logger} from '@nestjs/common';
import {IsString,MinLength,MaxLength,IsUUID,IsISO8601,IsInt,Min,Max,IsIn} from 'class-validator';
import {Db} from './db';
import {NotificationService} from './integrations';
import {Permit} from './security';
import {hasPermission} from './policy';
class MeetingDto {
 @IsString() @MinLength(3) @MaxLength(200) title!:string;
 @IsUUID() employeeId!:string;
 @IsUUID() managerId!:string;
 @IsISO8601() date!:string;
 @IsInt() @Min(0) @Max(10080) reminderMinutes!:number;
}
class StatusDto {@IsIn(['CANCELLED','COMPLETED']) status!:'CANCELLED'|'COMPLETED'}
@Controller('meetings')
export class MeetingsController {
 constructor(private db:Db){}
 @Get() list(@Req() r:any){return this.db.meeting.findMany({where:hasPermission(r.user.permissions,'meetings:write')?{}:{OR:[{employeeId:r.user.id},{managerId:r.user.id}]},include:{employee:{select:{id:true,name:true}},manager:{select:{id:true,name:true}}},orderBy:{date:'asc'},take:200})}
 @Permit('meetings:write') @Post() async create(@Req() r:any,@Body() d:MeetingDto){if(Date.parse(d.date)<=Date.now())throw new BadRequestException('زمان جلسه باید در آینده باشد.');const manager=await this.db.user.findUnique({where:{id:d.managerId},include:{roles:{include:{role:true}}}});if(!manager?.active||!manager.roles.some(x=>['SUPER_ADMIN','HOLDING_MANAGER','EDITOR_IN_CHIEF'].includes(x.role.name)))throw new BadRequestException('مدیر جلسه معتبر نیست.');return this.db.$transaction(async tx=>{const meeting=await tx.meeting.create({data:{...d,date:new Date(d.date)}});await tx.notification.createMany({data:[...new Set([d.employeeId,d.managerId])].map(userId=>({userId,title:'جلسه جدید',body:d.title+' — '+new Date(d.date).toLocaleString('fa-IR',{timeZone:'Asia/Tehran'})}))});await tx.adminLog.create({data:{actorId:r.user.id,action:'meeting.created',entity:'meeting',entityId:meeting.id}});return meeting})}
 @Permit('meetings:write') @Patch(':id') async update(@Req() r:any,@Param('id',ParseUUIDPipe) id:string,@Body() d:StatusDto){return this.db.$transaction(async tx=>{const meeting=await tx.meeting.update({where:{id},data:{status:d.status}});await tx.notification.createMany({data:[...new Set([meeting.employeeId,meeting.managerId])].map(userId=>({userId,title:d.status==='CANCELLED'?'جلسه لغو شد':'جلسه تکمیل شد',body:meeting.title}))});return {ok:true}})}
}
@Injectable()
export class MeetingReminders implements OnModuleInit,OnModuleDestroy {
 private timer?:ReturnType<typeof setInterval>;
 private running=false;
 private logger=new Logger('MeetingReminders');
 constructor(private db:Db,private notifications:NotificationService){}
 onModuleInit(){void this.tick();this.timer=setInterval(()=>void this.tick(),30000)}
 onModuleDestroy(){if(this.timer)clearInterval(this.timer)}
 async tick(){if(this.running)return;this.running=true;try{await this.db.$transaction(async tx=>{
  // Lock only due meetings; notifications and claim commit atomically, including across replicas.
  const due=await tx.$queryRaw<Array<{id:string;employeeId:string;managerId:string;title:string;date:Date}>>`SELECT id,"employeeId","managerId",title,date FROM meetings WHERE status='APPROVED' AND "remindedAt" IS NULL AND date>NOW()-INTERVAL '5 minutes' AND date - "reminderMinutes" * INTERVAL '1 minute' <= NOW() ORDER BY date LIMIT 100 FOR UPDATE SKIP LOCKED`;
  for(const m of due){await tx.notification.createMany({data:[...new Set([m.employeeId,m.managerId])].map(userId=>({userId,title:'یادآوری جلسه',body:m.title+' — '+m.date.toLocaleString('fa-IR',{timeZone:'Asia/Tehran'})}))});await tx.meeting.update({where:{id:m.id},data:{remindedAt:new Date()}})}
 });await this.notifications.dispatch();}catch{this.logger.error('Meeting reminder processing failed')}finally{this.running=false}}
}
