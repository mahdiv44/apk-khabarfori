import type {Metadata,Viewport} from 'next';
export const metadata:Metadata={title:'KhabarFori | خبرفوری همراه',description:'اخبار و تحلیل‌های خبرفوری در موبایل',manifest:'/mobile/manifest.webmanifest',appleWebApp:{capable:true,title:'خبرفوری',statusBarStyle:'default'},icons:{icon:'/brand/khabarfoori-icon.png',apple:{url:'/brand/khabarfoori-icon.png',sizes:'152x152'}}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#145846'};
export default function MobileLayout({children}:{children:React.ReactNode}){return children}
