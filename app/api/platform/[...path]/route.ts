import {productionProxy} from '@/production/proxy';
import {env} from 'cloudflare:workers';
import {sampleNews,sampleEmployees,sampleMessages} from '@/lib/sample';
import {z} from 'zod';
const articleSchema=z.object({title:z.string().min(3).max(200),description:z.string().min(3).max(500),content:z.string().min(3).max(100000),category:z.enum(['سیاست','اقتصاد','جامعه','فناوری','بین‌الملل','فرهنگ']),status:z.enum(['DRAFT','REVIEW','PUBLISHED']),vip:z.boolean(),tags:z.array(z.string().max(60)).max(20),coverImage:z.string().url().optional()});
const messageSchema=z.object({subject:z.string().min(3).max(200),body:z.string().min(3).max(10000),type:z.enum(['MESSAGE','IDEA','REPORT','REVIEW'])});
const employeeSchema=z.object({fullName:z.string().min(2).max(100),position:z.string().min(2).max(100),department:z.enum(['مدیریت','تحریریه','خبرنگاری','روابط عمومی','فنی','پشتیبانی']),biography:z.string().max(2000),email:z.string().email()});
const respond=(d:unknown,status=200,headers:Record<string,string>={})=>Response.json(d,{status,headers:{'Cache-Control':'no-store',...headers}});
async function handle(request:Request){
 const e=env as unknown as {DB:any;KHABARFORI_API_URL?:string};
 const url=new URL(request.url),path=url.pathname.split('/api/platform/')[1]||'',method=request.method;
 if(!['GET','HEAD'].includes(method)){const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return respond({message:'درخواست نامعتبر'},403);if(Number(request.headers.get('content-length')||0)>150000)return respond({message:'حجم درخواست بیش از حد مجاز است'},413)}
 if(e.KHABARFORI_API_URL)return productionProxy(request,e.KHABARFORI_API_URL);
 const owner=request.headers.get('oai-authenticated-user-id');if(!owner)return respond({message:'برای استفاده از محیط نمایشی وارد حساب ChatGPT شوید.'},401);
 const db=e.DB;if(!db)return respond({message:'ذخیره‌سازی موقتاً در دسترس نیست.'},503);
 const records=await db.prepare('SELECT kind,id,data FROM preview_records WHERE owner = ?').bind(owner).all();const rows=records.results as {kind:string;id:string;data:string}[];
 const merge=(kind:string,seed:any[])=>{const changes=rows.filter(r=>r.kind===kind);return [...seed.map(s=>changes.find(r=>r.id===s.id)?JSON.parse(changes.find(r=>r.id===s.id)!.data):s),...changes.filter(r=>!seed.some(s=>s.id===r.id)).map(r=>JSON.parse(r.data))].filter(x=>!x.deleted)};
 const news=merge('news',sampleNews),employees=merge('employees',sampleEmployees),messages=merge('messages',sampleMessages),bookmarks=rows.filter(r=>r.kind==='bookmark').map(r=>r.id);
 const save=async(kind:string,id:string,data:unknown)=>db.prepare('INSERT INTO preview_records (owner,kind,id,data) VALUES (?,?,?,?) ON CONFLICT(owner,kind,id) DO UPDATE SET data=excluded.data').bind(owner,kind,id,JSON.stringify(data)).run();
 const profile=rows.find(r=>r.kind==='profile');
 if(path==='workspace'&&method==='GET')return respond({demo:true,news:news.map(n=>({...n,content:''})),employees,messages,bookmarks,profile:profile?JSON.parse(profile.data):{name:'کاربر نمایشی',email:request.headers.get('oai-authenticated-user-email')||''},notifications:[],users:[],subscription:null});
 const [resource,id,action]=path.split('/');
 if(resource==='news'){
  if(action){const n=news.find(n=>n.id===id&&n.status==='PUBLISHED');if(!n)return respond({message:'خبر پیدا نشد'},404);if(n.vip)return respond({message:'اشتراک ویژه لازم است.'},403);
   if(action==='comments'&&method==='GET')return respond(rows.filter(r=>r.kind==='comment').map(r=>JSON.parse(r.data)).filter(c=>c.newsId===id));
   if(action==='comments'&&method==='POST'){const data=z.object({body:z.string().min(1).max(2000)}).parse(await request.json());const c={...data,id:crypto.randomUUID(),newsId:id,author:'کاربر نمایشی'};await save('comment',c.id,c);return respond(c,201)}
   if(action==='reactions'&&method==='POST'){await save('reaction',id,{id});return respond({ok:true})}
   if(action==='reactions'&&method==='DELETE'){await db.prepare('DELETE FROM preview_records WHERE owner=? AND kind=? AND id=?').bind(owner,'reaction',id).run();return respond({ok:true})}
   if(action==='views'&&method==='POST')return respond({ok:true});
   return respond({message:'مسیر پیدا نشد'},404);
  }

  if(method==='GET'&&id){const n=news.find(n=>n.id===id);return n?respond({...n,content:n.vip&&url.searchParams.get('edit')!=='true'?'':n.content}):respond({message:'خبر پیدا نشد'},404)}
  if(method==='POST'||method==='PATCH'){const data=articleSchema.parse(await request.json());if(method==='PATCH'&&!news.some(n=>n.id===id))return respond({message:'خبر پیدا نشد'},404);const saved={...news.find(n=>n.id===id),...data,id:id||crypto.randomUUID(),author:'کاربر نمایشی',createdAt:new Date().toISOString(),views:0};await save('news',saved.id,saved);return respond(saved,method==='POST'?201:200)}
  if(method==='DELETE'&&id){await save('news',id,{deleted:true});return respond({ok:true})}
 }
 if(resource==='bookmarks'&&id){if(!news.some(n=>n.id===id&&n.status==='PUBLISHED'))return respond({message:'خبر منتشرشده پیدا نشد'},404);if(method==='POST')await save('bookmark',id,{id});else if(method==='DELETE')await db.prepare('DELETE FROM preview_records WHERE owner=? AND kind=? AND id=?').bind(owner,'bookmark',id).run();else return respond({message:'روش نامعتبر'},405);return respond({ok:true})}
 if(resource==='messages'){
  if(method==='POST'){const d={...messageSchema.parse(await request.json()),id:crypto.randomUUID(),sender:'کاربر نمایشی',status:'NEW',reply:''};await save('messages',d.id,d);return respond(d,201)}
  if(method==='PATCH'&&id){const old=messages.find(m=>m.id===id);if(!old)return respond({message:'پیام پیدا نشد'},404);const patch=z.object({reply:z.string().max(10000),status:z.enum(['NEW','REVIEWING','COMPLETED'])}).parse(await request.json());await save('messages',id,{...old,...patch});return respond({ok:true})}
 }
 if(resource==='employees'&&method==='POST'){const d={...employeeSchema.parse(await request.json()),id:crypto.randomUUID()};await save('employees',d.id,d);return respond(d,201)}
 if(path==='profile'&&method==='PATCH'){const d=z.object({name:z.string().min(2).max(100)}).parse(await request.json());await save('profile','self',{...d,email:request.headers.get('oai-authenticated-user-email')||''});return respond(d)}
 if(path==='notifications/read'&&method==='POST')return respond({ok:true});
 if(resource==='auth'||resource==='subscriptions'||resource==='users'||resource==='media')return respond({message:'این قابلیت پس از اتصال سرویس تولید فعال می‌شود. تنظیمات اتصال را بررسی کنید.'},503);
 return respond({message:'مسیر پیدا نشد'},404);
}
async function dispatch(request:Request){try{return await handle(request)}catch(error){if(error instanceof z.ZodError)return respond({message:'اطلاعات فرم معتبر نیست؛ فیلدهای ضروری را بررسی کنید.',issues:error.issues},400);console.error('platform request failed',error instanceof Error?error.message:'unknown');return respond({message:'سرویس موقتاً در دسترس نیست؛ دوباره تلاش کنید.'},503)}}
export const GET=dispatch;export const POST=dispatch;export const PATCH=dispatch;export const DELETE=dispatch;
