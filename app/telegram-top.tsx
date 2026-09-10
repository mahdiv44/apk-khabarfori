'use client';
import {useEffect,useState} from 'react';
type Post={id:number;excerpt:string;reactions:number;forwards:number;score:number;url:string;publishedAt:string};
type Feed={connected:boolean;items:Post[];stale?:boolean;complete?:boolean;capturedAt?:string;missingMetrics?:number;message?:string};
export default function TelegramTop(){
 const [feed,setFeed]=useState<Feed|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 async function load(signal?:AbortSignal){setLoading(true);setError('');try{
  const response=await fetch('/api/platform/social/telegram/top',{signal});
  if(!response.ok)throw Error('دریافت آمار تلگرام انجام نشد.');
  setFeed(await response.json());
 }catch(e){if(!signal?.aborted)setError((e as Error).message)}finally{if(!signal?.aborted)setLoading(false)}}
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort()},[]);
 return <section className="panel" aria-label="پرطرفدارهای تلگرام">
  <div className="panel-heading"><h2>پرطرفدارهای تلگرام</h2><button className="button secondary-button" disabled={loading} onClick={()=>load()}>به‌روزرسانی</button></div>
  <p>کانال @AkhbareFori · مجموع واکنش‌ها و فورواردها · ۲۴ ساعت اخیر</p>
  {loading&&<p role="status">در حال دریافت…</p>}
  {error&&<p role="alert">{error}</p>}
  {feed&&!feed.connected&&<p>{feed.message||'دریافت آمار تلگرام هنوز فعال نشده است.'}</p>}
  {feed?.capturedAt&&<p>آخرین دریافت: {new Date(feed.capturedAt).toLocaleString('fa-IR')}</p>}
  {feed?.stale&&<p role="status">آمار به‌روز نیست؛ آخرین اطلاعات دریافت‌شده نمایش داده می‌شود.</p>}
  {feed?.complete===false&&<p>رتبه‌بندی از پیام‌های بررسی‌شده است؛ پوشش ۲۴ ساعت کامل نیست.</p>}
  {!!feed?.missingMetrics&&<p>برای {feed.missingMetrics.toLocaleString('fa-IR')} پیام، آمار کامل در دسترس نبود و در رتبه‌بندی قرار نگرفتند.</p>}
  {feed?.connected&&!feed.items.length&&<p>پیامی با آمار کامل در بازه اخیر پیدا نشد.</p>}
  <div className="telegram-posts">{feed?.items.map((post,index)=><article key={post.id} style={{padding:'20px 0',borderBottom:'1px solid #e2e8e4'}}>
   <strong>رتبه {(index+1).toLocaleString('fa-IR')} · امتیاز {post.score.toLocaleString('fa-IR')}</strong>
   <p style={{whiteSpace:'pre-wrap',lineHeight:2}}>{post.excerpt}</p>
   <p>{post.reactions.toLocaleString('fa-IR')} واکنش · {post.forwards.toLocaleString('fa-IR')} فوروارد</p>
   <a className="text-button" href={post.url} target="_blank" rel="noopener noreferrer">مشاهده اصل خبر در تلگرام</a>
  </article>)}</div>
 </section>;
}
