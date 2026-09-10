import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import {plainToInstance} from 'class-transformer';
import {validate} from 'class-validator';
import {rankTelegram,checkCollector,TelegramSnapshot,TelegramService} from '../src/telegram';
const now=new Date('2026-09-10T12:00:00Z');
const post=(id:number,reactions:number|null,forwards:number|null,publishedAt='2026-09-10T10:00:00Z')=>({id,reactions,forwards,publishedAt,excerpt:'متن آزمایشی',views:999999});
test('Telegram ranks reactions plus forwards, excludes unknown counts and old posts',()=>{
 const items=rankTelegram([post(1,100,1),post(2,50,100),post(3,999,null),post(4,9999,9999,'2026-09-08T00:00:00Z')],now);
 assert.deepEqual(items.map(x=>x.id),[2,1]);
 assert.equal(items[0].score,150);
 assert.equal(items[0].url,'https://t.me/AkhbareFori/2');
});
test('Telegram ranking deduplicates messages and includes measured zero',()=>{
 const items=rankTelegram([post(1,0,0),post(2,1,0),post(2,3,0)],now);
 assert.equal(items.length,2);assert.equal(items[0].score,3);
});
test('collector rejects missing configuration and incorrect credential',()=>{
 assert.throws(()=>checkCollector(undefined,undefined));
 assert.throws(()=>checkCollector('wrong','x'.repeat(32)));
 assert.doesNotThrow(()=>checkCollector('x'.repeat(32),'x'.repeat(32)));
});
test('ingestion rejects negative counts and arbitrary source URLs',async()=>{
 const data=plainToInstance(TelegramSnapshot,{capturedAt:now.toISOString(),complete:true,scanned:1,missingMetrics:0,items:[{...post(1,-1,0),url:'https://attacker.example'}]});
 assert.ok((await validate(data,{whitelist:true,forbidNonWhitelisted:true})).length>0);
});
test('unconfigured collector never serves invented posts',async()=>{
 const service=new TelegramService({setting:{findUnique:async()=>null}} as any);
 assert.deepEqual((await service.read()).items,[]);
 assert.equal((await service.read()).connected,false);
});
