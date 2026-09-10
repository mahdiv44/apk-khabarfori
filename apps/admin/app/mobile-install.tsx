'use client';
import {useEffect,useState} from 'react';
import {Smartphone,Share,PlusSquare} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
export default function MobileInstall(){
 const [open,setOpen]=useState(false),[standalone,setStandalone]=useState(false),[offline,setOffline]=useState(false);
 useEffect(()=>{
  const display=window.matchMedia('(display-mode: standalone)');
  const update=()=>setStandalone(display.matches||(navigator as Navigator&{standalone?:boolean}).standalone===true);
  update();display.addEventListener('change',update);
  const connection=()=>setOffline(!navigator.onLine);connection();window.addEventListener('online',connection);window.addEventListener('offline',connection);
  if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('/khabarfori-sw.js',{scope:'/mobile'}).catch(()=>{});
  return()=>{display.removeEventListener('change',update);window.removeEventListener('online',connection);window.removeEventListener('offline',connection)};
 },[]);
 return <>{offline&&<div className="mobile-offline-status" role="status">اینترنت قطع است؛ برای دریافت یا ذخیره اطلاعات دوباره متصل شوید.</div>}{!standalone&&<button className="icon-button" aria-label="افزودن به صفحه اصلی" onClick={()=>setOpen(true)}><Smartphone size={22}/></button>}<Dialog open={open} onOpenChange={setOpen}><DialogContent dir="rtl" className="mobile-install-dialog"><DialogHeader><DialogTitle>خبرفوری روی صفحه اصلی</DialogTitle><DialogDescription>در آیفون، این صفحه را در Safari باز کنید.</DialogDescription></DialogHeader><ol className="install-steps"><li><Share size={21}/><span>گزینه اشتراک‌گذاری <b>Share</b> را انتخاب کنید.</span></li><li><PlusSquare size={21}/><span>روی <b>Add to Home Screen</b> بزنید.</span></li><li><Smartphone size={21}/><span>در صورت نمایش، <b>Open as Web App</b> را روشن کنید و <b>Add</b> را بزنید.</span></li></ol><p>بعد از اضافه‌کردن، خبرفوری را از آیکن صفحه اصلی باز کنید. دریافت خبرها و ورود به حساب به اینترنت نیاز دارد.</p></DialogContent></Dialog></>;
}
