export const rolePermissions:Record<string,string[]>={
 SUPER_ADMIN:['*'],
 HOLDING_MANAGER:['analytics:read','employees:read','employees:write','news:read-internal','messages:read','messages:reply','messages:write','users:read'],
 EDITOR_IN_CHIEF:['news:write','news:publish','news:read-internal','employees:read','messages:read','messages:reply','messages:write','analytics:read'],
 EMPLOYEE:['news:write','employees:read','messages:write'],
 VIP_SUBSCRIBER:[],NORMAL_USER:[]
};
export function hasPermission(permissions:string[],permission:string){return permissions.includes('*')||permissions.includes(permission)}
export function canReadPremium(expiresAt:Date|null,now=new Date()){return !!expiresAt&&expiresAt>now}
export function addMonthsClamped(date:Date,months:number){const result=new Date(date),day=result.getUTCDate();result.setUTCDate(1);result.setUTCMonth(result.getUTCMonth()+months);const last=new Date(Date.UTC(result.getUTCFullYear(),result.getUTCMonth()+1,0)).getUTCDate();result.setUTCDate(Math.min(day,last));return result}
export function identify(identifier:string){
 const raw=identifier.trim();
 if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw))return {email:raw.toLowerCase()};
 let value=raw.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[ ()-]/g,'');
 if(/^09\d{9}$/.test(value))value='+98'+value.slice(1);
 if(/^0098\d{10}$/.test(value))value='+'+value.slice(2);
 if(/^\+[1-9]\d{7,14}$/.test(value))return {phone:value};
 throw new Error('Use an email address or an E.164 phone number');
}
export function loginIdentity(identifier:string,adminEmail?:string){
 if(identifier.trim().toLowerCase()==='admin'&&adminEmail)return identify(adminEmail);
 return identify(identifier);
}
