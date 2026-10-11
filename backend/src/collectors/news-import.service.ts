import {Injectable} from '@nestjs/common';
import {Db} from '../db';
import {ImportedNews} from './website.collector';
@Injectable()
export class NewsImportService {
 constructor(private db:Db){}
 async importNews(data:ImportedNews){if(!data.title.trim())return {skipped:true};const category=await this.db.category.findUnique({where:{name:data.category||'جامعه'}});const author=process.env.NEWS_IMPORT_AUTHOR_ID?await this.db.user.findFirst({where:{id:process.env.NEWS_IMPORT_AUTHOR_ID,active:true,roles:{some:{role:{name:{in:['SUPER_ADMIN','EDITOR_IN_CHIEF']}}}}}}):null;if(!category||!author)throw Error('Configure NEWS_IMPORT_AUTHOR_ID as an active editor/admin');const existing=await this.db.news.findUnique({where:{sourceUrl:data.sourceUrl}});if(existing){await this.db.news.update({where:{id:existing.id},data:{sourceViews:data.sourceViews}});return {updated:true}}
 return this.db.news.upsert({where:{sourceUrl:data.sourceUrl},update:{sourceViews:data.sourceViews},create:{title:data.title.slice(0,200),description:data.description.slice(0,500),content:data.content,categoryId:category.id,authorId:author.id,sourceUrl:data.sourceUrl,sourceKind:data.sourceKind,sourceViews:data.sourceViews,status:process.env.NEWS_AUTO_PUBLISH==='true'?'PUBLISHED':'REVIEW',publishedAt:process.env.NEWS_AUTO_PUBLISH==='true'?new Date(data.publishedAt||Date.now()):null}})}
}
