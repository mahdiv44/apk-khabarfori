import {Injectable} from '@nestjs/common';
import {load} from 'cheerio';
import {Db} from '../db';
import {rankTelegram,TelegramSnapshot,TelegramItem} from '../telegram';
import {ImportedNews,publicPage,imageUrl} from './website.collector';
export function parsePublicTelegram(html:string,now=new Date()){
 const $=load(html);const items:TelegramItem[]=[];
 $('.tgme_widget_message').each((_,el)=>{const e=$(el);const post=e.attr('data-post')||'';if(!/^akhbarefori\/\d+$/i.test(post))return;
 const raw=e.find('.tgme_widget_message_views').text().trim().replace(/,/g,'');const match=raw.match(/^(\d+(?:\.\d+)?)([KM])?$/i);const date=e.find('time').attr('datetime');if(!date)return;
 const views=match?Math.round(Number(match[1])*(match[2]?.toUpperCase()==='K'?1000:match[2]?.toUpperCase()==='M'?1000000:1)):null;
 const style=e.find('.tgme_widget_message_photo_wrap').attr('style')||'';const photo=style.match(/url\(['"]?([^)'" ]+)/)?.[1];
 const excerpt=e.find('.tgme_widget_message_text').text().trim().slice(0,280);if(!excerpt)return;
 items.push({id:Number(post.split('/')[1]),excerpt,publishedAt:date,views,reactions:null,forwards:null,coverImage:imageUrl(photo,'https://t.me')});});
 return {capturedAt:now.toISOString(),complete:false,scanned:items.length,missingMetrics:0,items:items.filter(x=>Date.parse(x.publishedAt)<=now.getTime()).slice(0,100)};
}
@Injectable()
export class TelegramCollector {
 constructor(private db:Db){}
 async collect():Promise<ImportedNews[]>{
  const row=await this.db.setting.findUnique({where:{key:'telegram:akhbarefori'}});let snapshot=row?.value as unknown as TelegramSnapshot|undefined;
  if(!snapshot||Date.now()-Date.parse(snapshot.capturedAt)>45000){
   if(process.env.TELEGRAM_PUBLIC_PREVIEW!=='false')try{
    const fresh=parsePublicTelegram(await publicPage('https://t.me/s/akhbarefori'));
    const previousMax=Math.max(0,...(snapshot?.items||[]).map(x=>x.id));
    for(let page=1;page<5&&fresh.items.length<100;page++){
     const oldest=Math.min(...fresh.items.map(x=>x.id));
     if(!Number.isFinite(oldest)||oldest<=previousMax||!previousMax)break;
     const older=parsePublicTelegram(await publicPage('https://t.me/s/akhbarefori?before='+oldest));
     const existing=new Set(fresh.items.map(x=>x.id));const extra=older.items.filter(x=>!existing.has(x.id));if(!extra.length)break;
     fresh.items.push(...extra);fresh.scanned+=older.scanned;
    }
    fresh.items=fresh.items.slice(0,100);
    if(fresh.items.length){const value=JSON.parse(JSON.stringify(fresh));await this.db.setting.upsert({where:{key:'telegram:akhbarefori'},create:{key:'telegram:akhbarefori',value},update:{value}});snapshot=fresh;}
   }catch{/* Preserve the last snapshot and its honest stale indicator. */}
  }
  if(!snapshot||Date.now()-Date.parse(snapshot.capturedAt)>900000)return [];
  const ranks=new Map(rankTelegram(snapshot.items).map((x,i)=>[x.id,i+1]));
  return snapshot.items.filter(x=>x.excerpt.trim()).map(item=>({title:item.excerpt.slice(0,200),description:item.excerpt,content:item.excerpt,sourceUrl:`https://t.me/AkhbareFori/${item.id}`,sourceRank:ranks.get(item.id)??null,sourceKind:'telegram',sourceViews:item.views,coverImage:item.coverImage,publishedAt:item.publishedAt}));
 }
}
