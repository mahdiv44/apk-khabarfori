// Run against an isolated migrated and seeded test database only.
import assert from 'node:assert/strict';
const base=process.env.TEST_API_URL||'http://localhost:4000/api/v1';
async function request(path,method='GET',data,token){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,data:await r.json()}}
const suffix=Date.now();
const registration=await request('/auth/register','POST',{identifier:`reader${suffix}@example.com`,name:'Test Reader',password:'Test-password-123456'});assert.equal(registration.status,201);const token=registration.data.accessToken;
assert.equal((await request('/employees','GET',undefined,token)).status,403);
assert.equal((await request('/analytics','GET',undefined,token)).status,403);
assert.equal((await request('/news','POST',{title:'Forbidden',description:'description',content:'content',category:'اقتصاد',status:'PUBLISHED',vip:false,tags:[]},token)).status,403);
const injected=await request('/auth/register','POST',{identifier:`injected${suffix}@example.com`,name:'Bad User',password:'Test-password-123456',roles:['SUPER_ADMIN']});assert.equal(injected.status,400);
const admin=await request('/auth/login','POST',{identifier:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});assert.equal(admin.status,201);
const draft=await request('/news','POST',{title:'Integration draft',description:'A private draft summary',content:'Secret draft text',category:'اقتصاد',status:'DRAFT',vip:false,tags:['test']},admin.data.accessToken);assert.equal(draft.status,201);
assert.equal((await request('/news/'+draft.data.id)).status,404);
const premium=await request('/news','PATCH',undefined); // Unsupported route must not accidentally mutate data.
assert.ok(premium.status>=400);
const published=await request('/news/'+draft.data.id,'PATCH',{title:'Integration VIP',description:'Public premium preview',content:'PAID_SECRET',category:'اقتصاد',status:'PUBLISHED',vip:true,tags:['test']},admin.data.accessToken);assert.equal(published.status,200);
const anonymous=await request('/news/'+draft.data.id);assert.equal(anonymous.status,200);assert.equal(anonymous.data.content,'');
const reader=await request('/news/'+draft.data.id,'GET',undefined,token);assert.equal(reader.data.locked,true);
assert.equal((await request('/news/'+draft.data.id+'/comments','POST',{body:'cannot comment on locked content'},token)).status,403);
const refresh=await request('/auth/refresh','POST',{refreshToken:registration.data.refreshToken});assert.equal(refresh.status,201);
assert.equal((await request('/auth/refresh','POST',{refreshToken:registration.data.refreshToken})).status,401);
assert.equal((await request('/auth/logout','POST',{},refresh.data.accessToken)).status,201);
assert.equal((await request('/profile','GET',undefined,refresh.data.accessToken)).status,401);
console.log('PostgreSQL API integration checks passed');
