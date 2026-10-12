import {Injectable,Logger} from '@nestjs/common';
import {load} from 'cheerio';
import axios from 'axios';
import {lookup} from 'node:dns/promises';
import https from 'node:https';
import {isIP} from 'node:net';
export type ImportedNews={title:string;description:string;content:string;sourceUrl:string;sourceKind:string;sourceViews:number|null;publishedAt?:string;category?:string;coverImage?:string;sourceRank?:number};
// Only globally routable IPv4; pin the resolved address to prevent DNS rebinding.
export function publicIPv4(ip:string){if(isIP(ip)!==4)return false;const [a,b]=ip.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19)||ip.startsWith('192.0.2.')||ip.startsWith('198.51.100.')||ip.startsWith('203.0.113.'))}
export function parseFeed(xml:string,feedUrl:string):ImportedNews[]{const $=load(xml,{xml:true});const origin=new URL(feedUrl).origin;return $('item, entry').slice(0,100).toArray().flatMap((el,index)=>{const e=$(el);const raw=e.find('link').first().attr('href')||e.find('link').first().text();let url:URL;try{url=new URL(raw,feedUrl)}catch{return []}if(url.protocol!=='https:'||url.origin!==origin)return [];const text=(value:string)=>load(value).text().trim();const title=text(e.find('title').first().text()).slice(0,200);if(!title)return [];const description=text(e.find('description, summary, content').first().text()).slice(0,500)||title;const rawViews=e.find('views').first().text();const sourceViews=/^\d+$/.test(rawViews)?Math.min(Number(rawViews),2147483647):null;const date=e.find('pubDate, published, updated').first().text();return [{title,description,content:description,sourceUrl:url.href,sourceKind:'website',sourceViews,sourceRank:index+1,coverImage:feedImage(e,feedUrl),...Number.isFinite(Date.parse(date))?{publishedAt:new Date(date).toISOString()}:{}}]})}
@Injectable()
export class WebsiteCollector {
 private logger=new Logger('WebsiteCollector');
 async collect(){const items:ImportedNews[]=[];const urls=(process.env.NEWS_FEED_URLS||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,10);for(const raw of urls){try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443')throw Error();const {address}=await lookup(url.hostname,{family:4});if(!publicIPv4(address))throw Error();const agent=new https.Agent({lookup:(_hostname:any,opts:any,cb:any)=>opts.all?cb(null,[{address,family:4}]):cb(null,address,4)});const response=await axios.get<string>(url.href,{httpsAgent:agent,proxy:false,maxRedirects:0,timeout:12000,maxContentLength:2*1024*1024,responseType:'text',headers:{Accept:'application/rss+xml, application/atom+xml, application/xml'}});items.push(...parseFeed(response.data,url.href));}catch{this.logger.warn('A configured news feed could not be collected');throw Error('FEED_UNAVAILABLE')}}for(let i=0;i<items.length;i+=3){await Promise.all(items.slice(i,i+3).map(async item=>{if(!item.coverImage)try{item.coverImage=await articleImage(item.sourceUrl)}catch{/* Keep the story when its image is unavailable. */}}))}return items}
}

export function imageUrl(raw:string|undefined,base:string):string|undefined {
 try {if(!raw)return;const u=new URL(raw,base);if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.hostname==='localhost'||u.hostname.endsWith('.local')||isIP(u.hostname)&&!publicIPv4(u.hostname))return;return u.href;}catch{return;}
}
function feedImage(e:any,base:string){
 const enclosure=e.find('enclosure').toArray().find((x:any)=>/^image\//.test(x.attribs.type||''));
 const media=e.find('media\\:content, media\\:thumbnail').first().attr('url');
 const html=load(e.find('description, content').first().text());
 return imageUrl(enclosure?.attribs.url||media||html('img').first().attr('src'),base);
}
export async function publicPage(raw:string){
 const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443')throw Error('HTTPS required');
 const {address}=await lookup(url.hostname,{family:4});if(!publicIPv4(address))throw Error('Invalid host');
 const agent=new https.Agent({lookup:(_h:any,o:any,cb:any)=>o.all?cb(null,[{address,family:4}]):cb(null,address,4)});
 const response=await axios.get<string>(raw,{httpsAgent:agent,proxy:false,maxRedirects:0,timeout:6000,maxContentLength:2*1024*1024,responseType:'text'});return response.data;
}
async function articleImage(raw:string){const $=load(await publicPage(raw));return imageUrl($('meta[property="og:image"]').attr('content')||$('meta[name="twitter:image"]').attr('content'),raw);}
