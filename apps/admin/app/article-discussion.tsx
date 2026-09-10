'use client';
import {useEffect,useState} from 'react';
import {Heart,Send} from 'lucide-react';
import {toast} from 'sonner';
export default function ArticleDiscussion({id}:{id:string}){
 const [comments,setComments]=useState<any[]>([]),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[liked,setLiked]=useState(false),[error,setError]=useState('');
 async function request(path:string,method='GET',data?:unknown){const r=await fetch('/api/platform/news/'+id+'/'+path,{method,headers:{'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});const d=await r.json();if(!r.ok)throw Error(d.message||'عملیات انجام نشد');return d}
 async function load(){try{setComments(await request('comments'));setError('')}catch(e){setError((e as Error).message)}}
 useEffect(()=>{load();fetch('/api/platform/news/'+id+'/views',{method:'POST',headers:{'Content-Type':'application/json'}}).catch(()=>{});},[id]);
 return <section className="article-discussion"><h3>دیدگاه مخاطبان</h3><button className="text-button" onClick={async()=>{try{await request('reactions',liked?'DELETE':'POST');setLiked(!liked)}catch(e){toast.error((e as Error).message)}}}><Heart size={18} fill={liked?'currentColor':'none'}/>{liked?'پسندیده شد':'این مطلب را می‌پسندم'}</button>{error&&<p className="muted">{error}</p>}{comments.map(c=><blockquote key={c.id}><strong>{c.user?.name||c.author}</strong><p>{c.body}</p></blockquote>)}{!comments.length&&!error&&<p className="muted">اولین دیدگاه را شما بنویسید.</p>}<form className="standard-form" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await request('comments','POST',{body});setBody('');await load();toast.success('دیدگاه ثبت شد')}catch(e){toast.error((e as Error).message)}finally{setBusy(false)}}}><label>دیدگاه شما<textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} required rows={3}/></label><button disabled={busy} className="button primary"><Send size={16}/>ارسال دیدگاه</button></form></section>
}
