const response=(data:unknown,status=200,headers=new Headers())=>{headers.set('Cache-Control','no-store');return Response.json(data,{status,headers})};
export async function productionProxy(request:Request,baseUrl:string){
 const url=new URL(request.url),path=url.pathname.split('/api/platform/')[1]||'',method=request.method;
 if(!baseUrl)return response({message:'سرویس API پیکربندی نشده است.'},503);
 if(!['GET','HEAD'].includes(method)&&request.headers.get('origin')!==url.origin)return response({message:'درخواست نامعتبر'},403);
 if(path.startsWith('auth/refresh'))return response({message:'مسیر نامعتبر'},404);
 const cookies=request.headers.get('cookie')||'';
 let access=cookies.match(/(?:^|; )kf_access=([^;]*)/)?.[1];const refresh=cookies.match(/(?:^|; )kf_refresh=([^;]*)/)?.[1];
 const body=['GET','HEAD'].includes(method)?undefined:await request.arrayBuffer();if(body&&body.byteLength>6*1024*1024)return response({message:'حجم درخواست بیش از حد مجاز است'},413);
 const headers=new Headers();const secure=url.protocol==='https:'?'; Secure':'';
 const storeTokens=(tokens:any)=>{access=tokens.accessToken;headers.append('Set-Cookie',`kf_access=${tokens.accessToken}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=900`);headers.append('Set-Cookie',`kf_refresh=${tokens.refreshToken}; Path=/api/platform; HttpOnly${secure}; SameSite=Strict; Max-Age=2592000`);delete tokens.accessToken;delete tokens.refreshToken};
 const fetchApi=()=>fetch(baseUrl.replace(/\/$/,'')+'/api/v1/'+path+url.search,{method,headers:{'Content-Type':request.headers.get('content-type')||'application/json',...(access?{Authorization:'Bearer '+access}:{}),...(request.headers.get('idempotency-key')?{'Idempotency-Key':request.headers.get('idempotency-key')!}:{})},body,redirect:'error',signal:AbortSignal.timeout(20000)});
 try{
 let upstream=await fetchApi();
 if(upstream.status===401&&refresh&&!path.startsWith('auth/')){const renewed=await fetch(baseUrl.replace(/\/$/,'')+'/api/v1/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:refresh}),signal:AbortSignal.timeout(15000)});if(renewed.ok){storeTokens(await renewed.json());upstream=await fetchApi()}}
 const data=await upstream.json() as any;
 if((path==='auth/login'||path==='auth/register')&&upstream.ok&&data.accessToken)storeTokens(data);
 if(path==='auth/logout'||path==='auth/password'&&upstream.ok){headers.append('Set-Cookie',`kf_access=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`);headers.append('Set-Cookie',`kf_refresh=; Path=/api/platform; HttpOnly${secure}; SameSite=Strict; Max-Age=0`)}
 return response(data,upstream.status,headers);
 }catch{return response({message:'ارتباط با سرویس برقرار نشد؛ دوباره تلاش کنید.'},503,headers)}
}
