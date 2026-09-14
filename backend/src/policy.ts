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
export function identify(identifier:string){const value=identifier.trim();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return {email:value.toLowerCase()};if(/^\+[1-9]\d{7,14}$/.test(value))return {phone:value};throw new Error('Use an email address or an E.164 phone number')}
