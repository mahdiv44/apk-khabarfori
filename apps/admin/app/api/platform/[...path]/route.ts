import {productionProxy} from '@/lib/proxy';
export const dynamic='force-dynamic';
const handler=(r:Request)=>productionProxy(r,process.env.KHABARFORI_API_URL||'',process.env.KHABARFORI_PUBLIC_ORIGIN);
export const GET=handler;export const POST=handler;export const PATCH=handler;export const DELETE=handler;
