import {Controller,Get,Req} from '@nestjs/common';
import {Db} from './db';
import {hasPermission} from './policy';
import {newsSummary,presentNews} from './news';
export function deskKind(roles:string[]){return roles.includes('SUPER_ADMIN')?'admin':roles.includes('HOLDING_MANAGER')?'manager':roles.includes('EDITOR_IN_CHIEF')?'chief':roles.includes('EDITOR')?'editor':roles.includes('EMPLOYEE')?'reporter':'reader'}
@Controller('dashboard')
export class DashboardController {
 constructor(private db:Db){}
 @Get() async read(@Req() r:any){const u=r.user;const all=hasPermission(u.permissions,'news:read-internal');const write=hasPermission(u.permissions,'news:write');const stats=hasPermission(u.permissions,'analytics:read');const where=all?{}:{authorId:u.id};
 const [counts,queue,meetings,unread,employee,team,views]=await Promise.all([
  all||write?this.db.news.groupBy({by:['status'],where,_count:{_all:true}}):[],
  all||write?this.db.news.findMany({where:{...where,status:{in:['DRAFT','REVIEW']}},select:newsSummary,orderBy:{updatedAt:'desc'},take:12}):[],
  this.db.meeting.findMany({where:{status:'APPROVED',date:{gte:new Date()},OR:[{employeeId:u.id},{managerId:u.id}]},orderBy:{date:'asc'},take:5,select:{id:true,title:true,date:true}}),
  this.db.notification.count({where:{userId:u.id,readAt:null}}),
  this.db.employee.findUnique({where:{userId:u.id},select:{status:true}}),
  hasPermission(u.permissions,'users:read')?this.db.user.count({where:{active:true}}):null,
  stats?this.db.news.aggregate({_sum:{views:true}}):null
 ]);
 return {kind:deskKind(u.roles),profile:{name:u.name,roles:u.roles},permissions:u.permissions,counts:Object.fromEntries(counts.map(c=>[c.status,c._count._all])),queue:queue.map(presentNews),meetings,unread,salaryAvailable:employee?.status==='ACTIVE',team,views:views?views._sum.views||0:null};
 }
}
