import test from 'node:test';
import assert from 'node:assert/strict';
import {identify,loginIdentity} from '../src/policy';
import {productionProxy} from '../../production/proxy';

test('Iranian phone spellings resolve to a single account identity',()=>{
 for(const input of ['09123456789','۰۹۱۲۳۴۵۶۷۸۹','٠٩١٢٣٤٥٦٧٨٩','+98 912 345 6789','00989123456789'])
  assert.deepEqual(identify(input),{phone:'+989123456789'});
 assert.throws(()=>identify('0912'));
 assert.throws(()=>identify('admin'));
});
test('admin alias requires an explicitly configured account and cannot be registered',()=>{
 assert.deepEqual(loginIdentity('admin','owner@example.com'),{email:'owner@example.com'});
 assert.throws(()=>loginIdentity('admin'));
 assert.deepEqual(loginIdentity('+989123456789','owner@example.com'),{phone:'+989123456789'});
});
test('proxy behind TLS gateway uses configured origin for CSRF and Secure cookies',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({accessToken:'test',refreshToken:'test'});
 try{
  const request=(origin:string)=>new Request('http://admin:3000/api/platform/auth/login',{method:'POST',headers:{origin},body:'{}'});
  const good=await productionProxy(request('https://news.example.com'),'http://api:4000','https://news.example.com');
  assert.equal(good.status,200);
  assert.match(good.headers.get('set-cookie')||'',/; Secure;/);
  assert.equal((await productionProxy(request('https://attacker.example'),'http://api:4000','https://news.example.com')).status,403);
 }finally{globalThis.fetch=original}
});
