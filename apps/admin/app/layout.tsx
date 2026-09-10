import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'KhabarFori | خبرفوری',description:'سامانه یکپارچه خبر و مدیریت تحریریه خبرفوری',icons:{icon:'/brand/khabarfoori-icon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}</body></html>}
