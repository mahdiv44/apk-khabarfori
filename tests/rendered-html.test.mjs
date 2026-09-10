import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true}});
after(()=>vite.close());
test('shared components server-render Persian RTL workspace and dashboard',async()=>{
 const {default:Workspace}=await vite.ssrLoadModule('/app/workspace.tsx');
 const {default:Layout}=await vite.ssrLoadModule('/app/layout.tsx');
 const html=renderToStaticMarkup(React.createElement(Layout,null,React.createElement(Workspace)));
 assert.match(html,/lang="fa"/);assert.match(html,/dir="rtl"/);assert.match(html,/KhabarFori/);assert.match(html,/نبض رسانه/);assert.match(html,/مدیریت اخبار/);assert.match(html,/محیط نمایشی/);
});

test('mobile reader starts with news and bottom navigation instead of admin',async()=>{
 const {default:Workspace}=await vite.ssrLoadModule('/app/workspace.tsx');
 const html=renderToStaticMarkup(React.createElement(Workspace,{readerMode:true}));
 assert.match(html,/خبرها را از اینجا دنبال کنید/);
 assert.match(html,/mobile-bottom-nav/);
 assert.match(html,/aria-label="منوی اصلی"/);
 assert.doesNotMatch(html,/class="app-sidebar/);
 assert.doesNotMatch(html,/نبض رسانه، در دستان شما/);
});
