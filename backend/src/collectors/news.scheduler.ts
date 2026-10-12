import {Injectable,Logger,Controller,Post,Get} from '@nestjs/common';
import {WebsiteCollector} from './website.collector';
import {TelegramCollector} from './telegram.collector';
import {NewsImportService} from './news-import.service';
import {Db} from '../db';
import {Permit} from '../security';
@Injectable()
export class NewsScheduler {
 private running=false;
 constructor(private website:WebsiteCollector,private telegram:TelegramCollector,private importer:NewsImportService,private db:Db){}
 async run(){if(this.running)return {busy:true};this.running=true;let imported=0,updated=0,failed=0;try{const groups=await Promise.allSettled([this.website.collect(),this.telegram.collect()]);for(const group of groups){if(group.status==='rejected'){failed++;continue}const beforeFailed=failed;for(const item of group.value){try{const result=await this.importer.importNews(item);if('updated' in result)updated++;else if(!('skipped' in result))imported++}catch{failed++}}if(group===groups[0]&&group.value.length&&failed===beforeFailed){await this.db.news.updateMany({where:{sourceKind:'website',sourceUrl:{notIn:group.value.map(x=>x.sourceUrl)}},data:{sourceRank:null}})}}const value={imported,updated,failed,finishedAt:new Date().toISOString()};await this.db.setting.upsert({where:{key:'news:last-sync'},create:{key:'news:last-sync',value},update:{value}});return value}finally{this.running=false}}
}
@Controller('collectors')
export class CollectorController {
 constructor(private scheduler:NewsScheduler,private db:Db){}
 @Permit('news:publish') @Post('sync') sync(){return this.scheduler.run()}
 @Permit('news:publish') @Get('status') async status(){return {lastSync:(await this.db.setting.findUnique({where:{key:'news:last-sync'}}))?.value||null,websiteFeedsConfigured:!!process.env.NEWS_FEED_URLS,authorConfigured:!!process.env.NEWS_IMPORT_AUTHOR_ID,autoPublish:process.env.NEWS_AUTO_PUBLISH==='true'}}
}
