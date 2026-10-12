#!/usr/bin/env bash
set -euo pipefail
docker exec -i khabarfori-api-1 node <<'JS'
const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient();
(async()=>{try{
 console.log('MIGRATIONS',await db.$queryRawUnsafe('SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at'));
 const {NewsService}=require('./dist/src/news');
 const result=await new NewsService(db).list({sort:'rank',limit:1});
 console.log('NEWS_QUERY_OK',result.items.length);
}catch(e){console.log('NEWS_QUERY_ERROR',{name:e.name,code:e.code,message:e.message});process.exitCode=1;}finally{await db.$disconnect();}})();
JS
