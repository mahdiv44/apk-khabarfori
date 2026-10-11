import {Injectable} from '@nestjs/common';
import {Db} from '../db';
import {rankTelegram,TelegramSnapshot} from '../telegram';
import {ImportedNews} from './website.collector';
@Injectable()
export class TelegramCollector {
 constructor(private db:Db){}
 async collect():Promise<ImportedNews[]>{const row=await this.db.setting.findUnique({where:{key:'telegram:akhbarefori'}});if(!row)return [];const snapshot=row.value as unknown as TelegramSnapshot;if(Date.now()-Date.parse(snapshot.capturedAt)>900000)return [];return rankTelegram(snapshot.items).map(item=>({title:item.excerpt.slice(0,200),description:item.excerpt,content:item.excerpt,sourceUrl:item.url,sourceKind:'telegram',sourceViews:item.views,publishedAt:item.publishedAt}))}
}
