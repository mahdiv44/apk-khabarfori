import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import {hash} from 'bcryptjs';
import {JwtService} from '@nestjs/jwt';
import {SalaryAccess} from '../src/salary';
import {parseFeed,imageUrl} from '../src/collectors/website.collector';
import {deskKind,DashboardController} from '../src/dashboard';
test('salary accepts the account password and rejects legacy salary password',async()=>{
 const account={active:true,tokenVersion:2,passwordHash:await hash('account-password-123',4)};
 const profile={id:'p',version:1,failedAttempts:0,lockedUntil:null,salaryPasswordHash:await hash('old-salary-password',4)};
 const tx={user:{findUniqueOrThrow:async()=>account},$queryRaw:async()=>[],salaryProfile:{findUniqueOrThrow:async()=>profile,update:async({data}:any)=>Object.assign(profile,data)}};
 const db={employee:{findUnique:async()=>({status:'ACTIVE',salaryProfile:profile})},$transaction:async(fn:any)=>fn(tx)} as any;
 const service=new SalaryAccess(db,new JwtService({secret:'test-secret-32-characters-long-enough'}));const u={id:'u',tokenVersion:2} as any;
 await assert.rejects(()=>service.unlock(u,'old-salary-password'));
 assert.equal((await service.unlock(u,'account-password-123')).unlocked,true);
 for(let i=0;i<5;i++)await assert.rejects(()=>service.unlock(u,'wrong-password'));
 await assert.rejects(()=>service.unlock(u,'account-password-123'));
});
test('feed images and rank survive without inventing source views',()=>{
 const items=parseFeed('<rss><channel><item><title>First</title><link>https://news.example/1</link><enclosure url="https://cdn.example/photo.jpg" type="image/jpeg" /></item><item><title>Next</title><link>https://news.example/2</link><description><![CDATA[<img src="/two.jpg">Summary]]></description></item></channel></rss>','https://news.example/feed');
 assert.equal(items[0].coverImage,'https://cdn.example/photo.jpg');assert.equal(items[1].coverImage,'https://news.example/two.jpg');assert.deepEqual(items.map(x=>x.sourceRank),[1,2]);assert.equal(items[0].sourceViews,null);
 for(const url of ['http://image.example/a','https://127.0.0.1/a','https://localhost/a','https://user:password@cdn.example/a'])assert.equal(imageUrl(url,'https://news.example'),undefined);
});
test('dashboard distinguishes delegated editor, chief and management',()=>{
 assert.equal(deskKind(['EDITOR']),'editor');assert.equal(deskKind(['EDITOR_IN_CHIEF']),'chief');assert.equal(deskKind(['HOLDING_MANAGER']),'manager');assert.equal(deskKind(['EDITOR','SUPER_ADMIN']),'admin');
});
test('reader dashboard never requests editorial or organisation data',async()=>{
 const fail=()=>{throw Error('unauthorized data requested')};
 const db={news:{groupBy:fail,findMany:fail,aggregate:fail},user:{count:fail},meeting:{findMany:async()=>[]},notification:{count:async()=>0},employee:{findUnique:async()=>null}} as any;
 const result=await new DashboardController(db).read({user:{id:'u',name:'reader',roles:['NORMAL_USER'],permissions:[]}});
 assert.deepEqual(result.queue,[]);assert.equal(result.team,null);assert.equal(result.salaryAvailable,false);
});
import {parsePublicTelegram} from '../src/collectors/telegram.collector';
test('public Telegram preview ranks actual visible metrics and labels partial coverage',()=>{
 const now=new Date('2026-10-12T10:00:00Z');const html='<div class="tgme_widget_message" data-post="AkhbareFori/100"><div class="tgme_widget_message_text">An actual post</div><span class="tgme_widget_message_views">1.2K</span><time datetime="2026-10-12T09:00:00Z"></time><a class="tgme_widget_message_photo_wrap" style="background-image:url(https://cdn.example/photo.jpg)"></a></div>';
 const s=parsePublicTelegram(html,now);assert.equal(s.complete,false);assert.equal(s.items[0].views,1200);assert.equal(s.items[0].forwards,null);assert.equal(s.items[0].coverImage,'https://cdn.example/photo.jpg');assert.equal(s.items[0].id,100);assert.equal(parsePublicTelegram(html,new Date('2026-10-14')).items.length,1);
});
import {NewsService} from '../src/news';
test('latest feed includes both sources and does not require measured views or ranking',async()=>{
 let query:any;const service=new NewsService({news:{findMany:async(q:any)=>{query=q;return []}}} as any);
 await service.list({sort:'latest'});assert.equal(query.where.status,'PUBLISHED');assert.equal(query.where.sourceKind,undefined);assert.equal(query.where.sourceRank,undefined);assert.equal(query.orderBy[0].publishedAt.sort,'desc');
});
test('latest Telegram import keeps visible messages with unknown views',()=>{
 const snapshot=parsePublicTelegram('<div class="tgme_widget_message" data-post="AkhbareFori/123"><div class="tgme_widget_message_text">Latest</div><time datetime="2026-10-12T09:00:00Z"></time></div>',new Date('2026-10-12T10:00:00Z'));
 assert.equal(snapshot.items.length,1);assert.equal(snapshot.items[0].views,null);
});
