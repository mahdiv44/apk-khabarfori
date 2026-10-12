import {Injectable} from '@nestjs/common';
import {load} from 'cheerio';
import {Db} from '../db';
import {rankTelegram,TelegramSnapshot,TelegramItem} from '../telegram';
import {ImportedNews,publicPage,imageUrl} from './website.collector';
export function parsePublicTelegram(html:string,now=new Date()){
 const $=load(html);const items:TelegramItem[]=[];
 $('.tgme_widget_message').each((_,el)=>{const e=$(el);const post=e.attr('data-post')||'';if(!/^akhbarefori\/\d+$/i.test(post))return;
 const raw=e.find('.tgme_widget_message_views').text().trim().replace(/,/g,'');const match=raw.match(/^(\d+(?:\.\d+)?)([KM])?$/i);const date=e.find('time').attr('datetime');if(!match||!date)return;
 const views=Math.round(Number(match[1])*(match[2]?.toUpperCase()==='K'?1000:match[2]?.toUpperCase()==='M'?1000000:1));
 const style=e.find('.tgme_widget_message_photo_wrap').attr('style')||'';const photo=style.match(/url\(['"]?([^)'" ]+)/)?.[1];
 const excerpt=e.find('.tgme_widget_message_text').text().trim().slice(0,280);if(!excerpt)return;
 items.push({id:Number(post.split('/')[1]),excerpt,publishedAt:date,views,reactions:null,forwards:null,coverImage:imageUrl(photo,'https://t.me')});});
 return {capturedAt:now.toISOString(),complete:false,scanned:items.length,missingMetrics:0,items:rankTelegram(items,now)};
}
@Injectable()
export class TelegramCollector {
 constructor(private db:Db){}
 async collect():Promise<ImportedNews[]>{
  const row=await this.db.setting.findUnique({where:{key:'telegram:akhbarefori'}});let snapshot=row?.value as unknown as TelegramSnapshot|undefined;
  if(!snapshot||Date.now()-Date.parse(snapshot.capturedAt)>240000){
   if(process.env.TELEGRAM_PUBLIC_PREVIEW!=='false')try{
    const fresh=parsePublicTelegram(await publicPage('https://t.me/s/akhbarefori'));
    if(fresh.items.length){const value=JSON.parse(JSON.stringify(fresh));await this.db.setting.upsert({where:{key:'telegram:akhbarefori'},create:{key:'telegram:akhbarefori',value},update:{value}});snapshot=fresh;}
   }catch{/* Preserve the last snapshot and its honest stale indicator. */}
  }
  if(!snapshot||Date.now()-Date.parse(snapshot.capturedAt)>900000)return [];
  return rankTelegram(snapshot.items).map(item=>({title:item.excerpt.slice(0,200),description:item.excerpt,content:item.excerpt,sourceUrl:item.url,sourceKind:'telegram',sourceViews:item.views,coverImage:item.coverImage,publishedAt:item.publishedAt}));
 }
}
