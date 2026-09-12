'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  Crown,
  Radio,
  MessageSquare,
  Bookmark,
  User,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Eye,
  Clock,
  Send,
  Plus,
  ArrowUpLeft,
  Check,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  Settings,
  ShieldCheck,
  LockKeyhole,
  Building2,
  SlidersHorizontal,
  Flame,
  Volume2,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { sampleNews, sampleEmployees, sampleMessages, plans, categories, Article } from '@/lib/sample';
import { officialBrand } from '@/lib/brand';
import Workspace from './workspace';

const fa = (n: number) => n.toLocaleString('fa-IR');

const statusText: Record<string, string> = {
  PUBLISHED: 'منتشر شده',
  REVIEW: 'در حال بررسی',
  DRAFT: 'پیش‌نویس',
  NEW: 'جدید',
  REVIEWING: 'در حال بررسی سردبیر',
  COMPLETED: 'پاسخ داده شده'
};

export default function AndroidApp() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'news' | 'vip' | 'channels' | 'messages' | 'profile'>('news');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه اخبار');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState<'phone' | 'full'>('phone');
  const [adminDeskOpen, setAdminDeskOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('۱۲:۴۵');

  // Font size scaler for reader
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  // Data State
  const [news, setNews] = useState<Article[]>(sampleNews);
  const [employees, setEmployees] = useState(sampleEmployees);
  const [messages, setMessages] = useState(sampleMessages);
  const [bookmarks, setBookmarks] = useState<string[]>(['1', '3']);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; author: string; body: string; time: string }[]>>({
    '1': [
      { id: 'c1', author: 'علی رضایی', body: 'تحلیل بسیار دقیق و شفافی بود. امیدواریم تصمیمات کارشناسی عملی شود.', time: '۱۰ دقیقه پیش' },
      { id: 'c2', author: 'مریم سلیمانی', body: 'تشکر از تیم تحریریه خبرفوری برای پوشش سریع این گزارش.', time: '۲۵ دقیقه پیش' }
    ],
    '2': [
      { id: 'c3', author: 'دکتر کاظمی', body: 'مبحث هوش مصنوعی نیازمند بومی‌سازی زیرساخت‌های پردازشی کشور است.', time: '۱ ساعت پیش' }
    ]
  });

  // Active Reader Modal
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // New Message / Idea Modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [newMsgSubject, setNewMsgSubject] = useState('');
  const [newMsgType, setNewMsgType] = useState<'IDEA' | 'REPORT' | 'REVIEW' | 'MESSAGE'>('IDEA');
  const [newMsgBody, setNewMsgBody] = useState('');

  // Notifications Modal
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'خبر فوری اقتصادی', body: 'بسته سیاستی جدید ارزی بانک مرکزی ابلاغ شد.', time: '۵ دقیقه پیش', read: false },
    { id: 'n2', title: 'یادداشت سردبیر', body: 'تحلیل اختصاصی بررسی سناریوهای بازارهای مالی منتشر شد.', time: '۲ ساعت پیش', read: false },
    { id: 'n3', title: 'پاسخ به سوژه پیشنهادی', body: 'سردبیر محترم پیشنهاد گزارش شما را بررسی کرد.', time: 'دیروز', read: true }
  ]);

  // Clock simulation for Android status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const fHours = hours.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
      const fMinutes = minutes.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
      setCurrentTime(`${fHours}:${fMinutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live workspace data if available
  useEffect(() => {
    fetch('/api/platform/workspace')
      .then(res => res.json())
      .then(data => {
        if (data.news && Array.isArray(data.news)) setNews(data.news);
        if (data.employees && Array.isArray(data.employees)) setEmployees(data.employees);
        if (data.messages && Array.isArray(data.messages)) setMessages(data.messages);
        if (data.bookmarks && Array.isArray(data.bookmarks)) setBookmarks(data.bookmarks);
      })
      .catch(() => {
        // Fallback already pre-seeded
      });
  }, []);

  // Filtered news
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesCat = selectedCategory === 'همه اخبار' || item.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        item.title.includes(searchQuery) || 
        item.description.includes(searchQuery) ||
        (item.author && item.author.includes(searchQuery));
      return matchesCat && matchesSearch && item.status === 'PUBLISHED';
    });
  }, [news, selectedCategory, searchQuery]);

  // Featured breaking news
  const breakingNewsItem = news.find(n => n.vip || n.category === 'سیاست') || news[0];

  // Actions
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(b => b !== id) : [...prev, id];
      fetch(`/api/platform/bookmarks/${id}`, {
        method: exists ? 'DELETE' : 'POST'
      }).catch(() => {});
      toast.success(exists ? 'از ذخیره‌ها برداشته شد' : 'به ذخیره‌های آفلاین اضافه شد');
      return updated;
    });
  };

  const toggleLike = (id: string) => {
    setLikedArticles(prev => {
      const isLiked = !!prev[id];
      const next = !isLiked;
      setLikeCounts(c => ({
        ...c,
        [id]: (c[id] || 0) + (next ? 1 : -1)
      }));
      fetch(`/api/platform/news/${id}/reactions`, {
        method: next ? 'POST' : 'DELETE'
      }).catch(() => {});
      toast.success(next ? 'به علاقه‌مندی‌ها افزوده شد' : 'نشان پسندیدن برداشته شد');
      return { ...prev, [id]: next };
    });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingArticle || !commentInput.trim()) return;

    const newComment = {
      id: 'c_' + Date.now(),
      author: 'کاربر اندروید خبرفوری',
      body: commentInput.trim(),
      time: 'لحظاتی پیش'
    };

    setCommentsMap(prev => ({
      ...prev,
      [readingArticle.id]: [newComment, ...(prev[readingArticle.id] || [])]
    }));

    fetch(`/api/platform/news/${readingArticle.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: commentInput.trim() })
    }).catch(() => {});

    setCommentInput('');
    toast.success('دیدگاه شما با موفقیت ثبت گردید.');
  };

  const handleSendMessageToEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgSubject.trim() || !newMsgBody.trim()) return;

    const createdMsg = {
      id: 'msg_' + Date.now(),
      subject: newMsgSubject.trim(),
      body: newMsgBody.trim(),
      sender: 'کاربر همراه',
      type: newMsgType,
      status: 'NEW',
      reply: ''
    };

    setMessages(prev => [createdMsg, ...prev]);

    fetch('/api/platform/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: newMsgSubject.trim(),
        type: newMsgType,
        body: newMsgBody.trim()
      })
    }).catch(() => {});

    setNewMsgSubject('');
    setNewMsgBody('');
    setMessageModalOpen(false);
    toast.success('پیام شما با موفقیت به دفتر سردبیر ارسال شد.');
    setCurrentTab('messages');
  };

  const handleShare = async (article: Article) => {
    const url = typeof window !== 'undefined' ? window.location.origin + '?article=' + article.id : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${article.title}\n${url}`);
        toast.success('پیوند خبر در حافظه کپی شد');
      } catch {
        toast.error('امکان اشتراک‌گذاری در دسترس نیست');
      }
    }
  };

  // If user switches to Admin Desk
  if (adminDeskOpen) {
    return (
      <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
        <div className="bg-[#10473a] text-white px-4 py-2.5 flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-bold text-[11px]">میز تحریریه</span>
            <span>مدیریت یکپارچه پایگاه خبرفوری</span>
          </div>
          <button
            onClick={() => setAdminDeskOpen(false)}
            className="flex items-center gap-1.5 bg-white text-[#10473a] font-semibold px-3 py-1 rounded-md hover:bg-emerald-50 transition"
          >
            <Smartphone size={15} />
            <span>بازگشت به اپلیکیشن اندروید</span>
          </button>
        </div>
        <Workspace />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${deviceFrame === 'phone' ? 'bg-[#18231f] flex flex-col items-center justify-center p-2 sm:p-6' : 'bg-[#f4f7f5]'}`}>
      {/* Top Banner Control for AI Studio Preview */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mb-3 flex items-center justify-between px-2 text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-400">اپلیکیشن اندروید خبرفوری</span>
          <span className="text-neutral-400 text-[11px] hidden sm:inline">(Material Design 3 · Jetpack Compose)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrame(f => f === 'phone' ? 'full' : 'phone')}
            className="flex items-center gap-1 bg-[#233830] hover:bg-[#2c463c] text-emerald-300 px-2.5 py-1 rounded-md text-[11px] transition"
            title="تغییر نمای دستگاه"
          >
            {deviceFrame === 'phone' ? <Tablet size={13} /> : <Smartphone size={13} />}
            <span>{deviceFrame === 'phone' ? 'نمای تبلت / تمام‌صفحه' : 'قاب گوشی هوشمند'}</span>
          </button>

          <button
            onClick={() => setAdminDeskOpen(true)}
            className="flex items-center gap-1 bg-[#2a5043] hover:bg-[#346353] text-white px-2.5 py-1 rounded-md text-[11px] font-medium transition"
          >
            <SlidersHorizontal size={13} />
            <span>پنل تحریریه</span>
          </button>
        </div>
      </div>

      {/* Main Container - Framed like an Android Smartphone or Fluid Tablet */}
      <div
        className={`w-full bg-[#f8faf9] text-neutral-900 transition-all duration-300 relative flex flex-col overflow-hidden shadow-2xl ${
          deviceFrame === 'phone'
            ? 'max-w-[420px] min-h-[850px] h-[92vh] max-h-[900px] rounded-[42px] border-[10px] border-[#1e2a25] ring-1 ring-white/10'
            : 'max-w-4xl min-h-[90vh] rounded-2xl border border-neutral-200 shadow-xl'
        }`}
        dir="rtl"
      >
        {/* Android Status Bar */}
        <div className="w-full bg-[#125846] text-white/90 px-6 pt-3 pb-2 flex items-center justify-between text-xs font-mono select-none z-30">
          <span className="font-bold tracking-wider">{currentTime}</span>

          {/* Android Camera Notch in Phone Mode */}
          {deviceFrame === 'phone' && (
            <div className="w-4 h-4 rounded-full bg-[#0d3f32] border-2 border-[#16634f] mx-auto shadow-inner" />
          )}

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[10px] font-sans font-bold bg-white/20 px-1 rounded">5G</span>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3C7.5 3 3.7 4.8 1 7.8L12 21 23 7.8C20.3 4.8 16.5 3 12 3z"/>
            </svg>
            <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 24 24">
              <path d="M17 5v14c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h8c.55 0 1 .45 1 1zm-1 1H8v12h8V6z"/>
            </svg>
            <span>۹۸٪</span>
          </div>
        </div>

        {/* Material 3 TopAppBar */}
        <header className="bg-[#145f4c] text-white px-4 py-3 shadow-md flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition"
              aria-label="منوی اصلی"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2 select-none">
              <img
                src="/brand/khabarfoori-logo.png"
                alt="خبرفوری"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
              <span className="text-xs font-bold bg-[#1a7860] px-2 py-0.5 rounded text-emerald-100 hidden xs:inline">
                اندروید
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchActive(v => !v)}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition"
              aria-label="جست‌وجو"
            >
              <Search size={19} />
            </button>

            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition relative"
              aria-label="اعلان‌ها"
            >
              <Bell size={19} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#145f4c]" />
              )}
            </button>

            <button
              onClick={() => {
                setCurrentTab('profile');
              }}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition"
              aria-label="پروفایل من"
            >
              <User size={19} />
            </button>
          </div>
        </header>

        {/* Expandable Search Field */}
        {searchActive && (
          <div className="bg-[#0f4d3d] p-2.5 shadow-inner flex items-center gap-2 z-20 animate-fadeIn">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="جست‌وجو در تیتر، متن و گزارش‌ها..."
                className="w-full bg-white text-neutral-800 pr-9 pl-8 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => { setSearchActive(false); setSearchQuery(''); }}
              className="text-xs text-white/80 hover:text-white px-2 py-1"
            >
              بستن
            </button>
          </div>
        )}

        {/* Breaking News Ticker (نوار خبر فوری) */}
        <div className="bg-[#dcfce7] border-b border-emerald-200 px-3 py-1.5 flex items-center justify-between text-xs text-emerald-950 font-medium z-10 select-none">
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <span className="flex items-center gap-1 bg-[#145f4c] text-white px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
              <Flame size={12} className="text-amber-300 animate-bounce" />
              فوری
            </span>
            <p className="truncate text-[11px] cursor-pointer hover:underline" onClick={() => setReadingArticle(breakingNewsItem)}>
              {breakingNewsItem?.title || 'جدیدترین رویدادها را در پیام‌رسان‌ها و سامانه خبرفوری دنبال کنید'}
            </p>
          </div>
          <ChevronLeft size={14} className="text-emerald-700 shrink-0" />
        </div>

        {/* Horizontal Category Chips (Material 3 FilterChips) - only on news tab */}
        {currentTab === 'news' && (
          <div className="bg-white border-b border-neutral-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-10">
            {['همه اخبار', ...categories].map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    active
                      ? 'bg-[#156a55] text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Body Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#f6f9f7] pb-24 p-3 scrollbar-thin">
          {/* TAB 1: NEWS FEED */}
          {currentTab === 'news' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Featured Top Story Card */}
              {filteredNews.length > 0 && selectedCategory === 'همه اخبار' && !searchQuery && (
                <div
                  onClick={() => setReadingArticle(filteredNews[0])}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200/80 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="relative h-44 bg-gradient-to-tr from-[#124b3c] to-[#1c7860] flex items-end p-4">
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="bg-[#145f4c]/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {filteredNews[0].category}
                      </span>
                      {filteredNews[0].vip && (
                        <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
                          <Crown size={11} /> ویژه
                        </span>
                      )}
                    </div>

                    <button
                      onClick={e => toggleBookmark(filteredNews[0].id, e)}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50"
                      aria-label="ذخیره خبر"
                    >
                      <Bookmark
                        size={16}
                        fill={bookmarks.includes(filteredNews[0].id) ? 'white' : 'none'}
                      />
                    </button>

                    <div className="text-white z-10">
                      <span className="text-[10px] text-emerald-200 font-medium">گزارش ویژه تحریریه</span>
                      <h2 className="text-base font-bold leading-snug line-clamp-2 mt-0.5 group-hover:text-emerald-100 transition">
                        {filteredNews[0].title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {filteredNews[0].description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {filteredNews[0].author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {fa(filteredNews[0].views || 1200)} بازدید
                        </span>
                      </div>
                      <span className="text-emerald-700 font-medium flex items-center gap-0.5 text-xs">
                        مطالعه گزارش <ChevronLeft size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* News Feed List */}
              <div className="space-y-2.5">
                {(selectedCategory === 'همه اخبار' && !searchQuery
                  ? filteredNews.slice(1)
                  : filteredNews
                ).map(article => (
                  <div
                    key={article.id}
                    onClick={() => setReadingArticle(article)}
                    className="bg-white rounded-xl p-3 border border-neutral-200/70 shadow-sm hover:border-emerald-300 transition cursor-pointer flex gap-3 group"
                  >
                    {/* Thumbnail placeholder with initial or gradient */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex flex-col items-center justify-center shrink-0 p-1 relative overflow-hidden">
                      <span className="text-xl font-black opacity-40">خ‌ف</span>
                      <span className="text-[9px] bg-black/40 px-1 rounded absolute bottom-1 font-sans">
                        {article.category}
                      </span>
                      {article.vip && (
                        <span className="absolute top-1 right-1 text-amber-300">
                          <Crown size={12} />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                          <span>{article.category}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {new Date(article.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-neutral-800 leading-snug line-clamp-2 group-hover:text-[#156a55] transition">
                          {article.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 text-[11px] text-neutral-400">
                        <span className="truncate max-w-[120px] text-[10px]">
                          {article.author}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => toggleBookmark(article.id, e)}
                            className="p-1 text-neutral-400 hover:text-emerald-700 transition"
                            aria-label="نشانه‌گذاری"
                          >
                            <Bookmark
                              size={14}
                              fill={bookmarks.includes(article.id) ? '#156a55' : 'none'}
                              className={bookmarks.includes(article.id) ? 'text-[#156a55]' : ''}
                            />
                          </button>

                          <span className="flex items-center gap-1 text-[10px]">
                            <Eye size={11} /> {fa(article.views || 450)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNews.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-neutral-300 my-4">
                    <Search size={32} className="mx-auto text-neutral-400 mb-2" />
                    <h4 className="font-bold text-sm text-neutral-700">خبری در این بخش یافت نشد</h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      می‌توانید فیلتر دسته‌بندی را تغییر داده یا جست‌وجوی دیگری انجام دهید.
                    </p>
                    <button
                      onClick={() => { setSelectedCategory('همه اخبار'); setSearchQuery(''); }}
                      className="mt-3 bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                    >
                      نمایش همه اخبار
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VIP ANALYSES (دیدگاه‌های ویژه) */}
          {currentTab === 'vip' && (
            <div className="space-y-4 animate-fadeIn">
              {/* VIP Gold Banner */}
              <div className="bg-gradient-to-r from-[#184637] via-[#103a2e] to-[#0c2f24] text-white p-4 rounded-2xl shadow-md relative overflow-hidden border border-amber-500/30">
                <div className="absolute -left-4 -bottom-4 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                  <Crown size={18} />
                  <span>بخش اشتراک ویژه خبرفوری</span>
                </div>
                <h2 className="text-base font-black">تحلیل‌های عمیق، فراتر از اخبار روزمره</h2>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  دیدگاه‌های اختصاصی نخبگان اقتصادی، سیاسی و اجتماعی با دسترسی بی‌محدود به آرشیو تحلیلی.
                </p>
              </div>

              {/* VIP Articles List */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  تحلیل‌های منتخب تحریریه ویژه
                </h3>

                {news.filter(n => n.vip || ['اقتصاد', 'سیاست'].includes(n.category)).map(article => (
                  <div
                    key={article.id}
                    onClick={() => setReadingArticle(article)}
                    className="bg-white rounded-xl p-3.5 border border-amber-200/60 shadow-sm hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
                          <Crown size={10} /> دیدگاه تحلیلی
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                          {article.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {article.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>نویسنده: {article.author}</span>
                      <span className="text-amber-700 font-bold flex items-center gap-0.5 text-xs">
                        مطالعه ویژه <ChevronLeft size={13} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscription Plans */}
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm mt-4">
                <h3 className="text-xs font-bold text-neutral-800 text-center mb-3">
                  طرح‌های عضویت ویژه خبرفوری
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {plans.map((plan, idx) => (
                    <div
                      key={plan.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        idx === 1
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                          : 'border-neutral-200 bg-neutral-50/50'
                      }`}
                    >
                      <div>
                        {idx === 1 && (
                          <span className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded inline-block mb-1">
                            پیشنهاد سردبیر
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-neutral-800">{plan.name}</h4>
                        <div className="text-emerald-800 font-black text-sm my-1">
                          {fa(plan.price)} <span className="text-[10px] font-normal text-neutral-500">تومان</span>
                        </div>
                        <p className="text-[10px] text-neutral-500">دسترسی {fa(plan.months)} ماهه</p>
                      </div>

                      <button
                        onClick={() => {
                          toast.success(`طرح ${plan.name} انتخاب شد (شبیه‌سازی پرداخت)`);
                        }}
                        className={`mt-3 w-full py-1.5 rounded-lg text-xs font-bold transition ${
                          idx === 1
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        تهیه اشتراک
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL CHANNELS (کانال‌های رسمی) */}
          {currentTab === 'channels' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center shadow-sm">
                <img
                  src="/brand/khabarfoori-logo.png"
                  alt="خبرفوری"
                  className="h-10 mx-auto object-contain mb-2"
                />
                <h2 className="text-sm font-bold text-neutral-800">شبکه رسمی خبرفوری در پیام‌رسان‌ها</h2>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  برای دریافت سریع‌ترین هشدارها و اخبار موثق، کانال‌های رسمی تایید شده ما را دنبال فرمایید.
                </p>

                <a
                  href={officialBrand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                >
                  <Globe size={14} /> مشاهده وب‌سایت اصلی khabarfoori.com <ExternalLink size={12} />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {officialBrand.channels.map(channel => (
                  <a
                    key={channel.url}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-sm hover:border-emerald-400 hover:bg-emerald-50/20 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#eef7f2] text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-[#145f4c] group-hover:text-white transition">
                        <Send size={18} />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-emerald-800 transition">
                          {channel.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-mono dir-ltr block truncate">
                          {channel.url.replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                    </div>

                    <ArrowUpLeft size={16} className="text-neutral-400 group-hover:text-emerald-700 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT & MESSAGES TO EDITOR (ارتباط با سردبیر) */}
          {currentTab === 'messages' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-emerald-700" />
                    میز ارتباط با سردبیر
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ایده‌ها، گزارش‌های مردمی و پیشنهادهای خود را مستقیماً ارسال فرمایید.
                  </p>
                </div>
                <button
                  onClick={() => setMessageModalOpen(true)}
                  className="bg-[#156a55] hover:bg-[#125846] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm shrink-0 transition"
                >
                  <Plus size={15} /> پیام جدید
                </button>
              </div>

              {/* Messages List */}
              <div className="space-y-2.5">
                {messages.map(msg => (
                  <div key={msg.id} className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-neutral-800">{msg.subject}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        msg.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        msg.status === 'REVIEWING' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {statusText[msg.status] || msg.status}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded-lg">
                      {msg.body}
                    </p>

                    {msg.reply && (
                      <div className="bg-emerald-50/70 border-r-2 border-emerald-600 p-2.5 rounded-l-lg text-xs space-y-1">
                        <span className="font-bold text-emerald-900 text-[11px] block">پاسخ سردبیر:</span>
                        <p className="text-emerald-800 leading-relaxed">{msg.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE & APP SETTINGS (حساب من و تنظیمات) */}
          {currentTab === 'profile' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* User Identity Card */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  ک‌ف
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">کاربر همراه خبرفوری</h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">khabarfori-user@android.app</p>
                  <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    اشتراک ویژه فعال تا پایان سال
                  </span>
                </div>
              </div>

              {/* Bookmarks Section */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Bookmark size={15} className="text-emerald-700" />
                    خبرهای نشان‌شده برای مطالعه آفلاین
                  </span>
                  <span className="text-[11px] bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600">
                    {fa(bookmarks.length)} خبر
                  </span>
                </h4>

                {bookmarks.length > 0 ? (
                  <div className="space-y-2">
                    {news.filter(n => bookmarks.includes(n.id)).map(bArticle => (
                      <div
                        key={bArticle.id}
                        onClick={() => setReadingArticle(bArticle)}
                        className="p-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="text-xs font-medium text-neutral-800 truncate">
                          {bArticle.title}
                        </span>
                        <button
                          onClick={e => toggleBookmark(bArticle.id, e)}
                          className="text-neutral-400 hover:text-red-500 p-1 shrink-0"
                          title="حذف از نشان‌شده‌ها"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-3">
                    هنوز هیچ مطلبی را نشان‌گذاری نکرده‌اید.
                  </p>
                )}
              </div>

              {/* Newsroom Colleagues Directory */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Building2 size={15} className="text-emerald-700" />
                  همکاران و اعضای تحریریه سازمان
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  {employees.slice(0, 4).map(emp => (
                    <div key={emp.id} className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-neutral-800 block">{emp.fullName}</span>
                        <span className="text-[10px] text-emerald-800 font-medium">{emp.position} · {emp.department}</span>
                      </div>
                      <a href={`mailto:${emp.email}`} className="text-emerald-700 text-[11px] bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100">
                        ایمیل
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* App Info & Settings */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <span>نگارش اپلیکیشن</span>
                  <span className="font-mono font-bold text-neutral-800">2.4.0 (Build 48)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <span>وضعیت اتصال و داده‌ها</span>
                  <span className="text-emerald-700 font-medium">برخط (همگام‌سازی ابری)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>قلم و رسم‌الخط</span>
                  <span>فونت وزیرمتن استاندارد فارسی</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Floating Action Button (FAB) on News tab */}
        {currentTab === 'news' && (
          <button
            onClick={() => setMessageModalOpen(true)}
            className="absolute bottom-20 left-4 z-20 bg-[#145f4c] hover:bg-[#0f4d3d] text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold active:scale-95 transition-all"
            aria-label="ارسال سوژه به تحریریه"
          >
            <Plus size={18} />
            <span className="hidden xs:inline">ارسال سوژه</span>
          </button>
        )}

        {/* Material 3 Bottom NavigationBar */}
        <nav className="bg-white border-t border-neutral-200/80 px-2 py-2 flex items-center justify-around z-20 absolute bottom-0 left-0 right-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          {[
            { id: 'news', label: 'اخبار', icon: Newspaper },
            { id: 'vip', label: 'دیدگاه ویژه', icon: Crown },
            { id: 'channels', label: 'کانال‌ها', icon: Radio },
            { id: 'messages', label: 'ارتباط سردبیر', icon: MessageSquare },
            { id: 'profile', label: 'حساب من', icon: User }
          ].map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id as any);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all ${
                  active ? 'text-[#145f4c] font-bold' : 'text-neutral-400 hover:text-neutral-600 font-normal'
                }`}
              >
                <div className={`px-4 py-1 rounded-full transition-all ${active ? 'bg-[#dcf3ea]' : 'bg-transparent'}`}>
                  <item.icon size={19} className={active ? 'text-[#145f4c]' : 'text-neutral-500'} />
                </div>
                <span className="text-[10px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Android Navigation Drawer Sheet (کشوی ناوبری اندروید) */}
        {drawerOpen && (
          <div className="absolute inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
            />

            {/* Drawer Content */}
            <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideRight">
              <div>
                {/* Drawer Header */}
                <div className="bg-[#145f4c] text-white p-5">
                  <div className="flex items-center justify-between mb-3">
                    <img
                      src="/brand/khabarfoori-logo.png"
                      alt="خبرفوری"
                      className="h-8 brightness-0 invert"
                    />
                    <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                      <X size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm">سامانه همراه خبرفوری</h3>
                  <p className="text-[11px] text-emerald-200 mt-0.5">نبض تحریریه و رویدادهای زنده ایران و جهان</p>
                </div>

                {/* Drawer Menu Items */}
                <div className="p-3 space-y-1 text-xs">
                  <button
                    onClick={() => { setCurrentTab('news'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${
                      currentTab === 'news' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Newspaper size={18} className="text-emerald-700" />
                    <span>آخرین اخبار و گزارش‌ها</span>
                  </button>

                  <button
                    onClick={() => { setCurrentTab('vip'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${
                      currentTab === 'vip' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Crown size={18} className="text-amber-600" />
                    <span>دیدگاه‌ها و یادداشت‌های ویژه</span>
                  </button>

                  <button
                    onClick={() => { setCurrentTab('channels'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${
                      currentTab === 'channels' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Radio size={18} className="text-emerald-700" />
                    <span>کانال‌های رسمی خبرفوری</span>
                  </button>

                  <button
                    onClick={() => { setCurrentTab('messages'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${
                      currentTab === 'messages' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <MessageSquare size={18} className="text-emerald-700" />
                    <span>ارتباط با سردبیر و ارسال ایده</span>
                  </button>

                  <button
                    onClick={() => { setCurrentTab('profile'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${
                      currentTab === 'profile' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <User size={18} className="text-emerald-700" />
                    <span>حساب کاربری و نشان‌شده‌ها</span>
                  </button>

                  <div className="pt-2 border-t border-neutral-100 my-2" />

                  <button
                    onClick={() => { setAdminDeskOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right text-emerald-800 hover:bg-emerald-50 transition font-medium"
                  >
                    <SlidersHorizontal size={18} />
                    <span>میز کار تحریریه (مدیریت وب)</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-[11px] text-neutral-400">
                <p>اپلیکیشن رسمی خبرگزاری خبرفوری</p>
                <p className="mt-0.5">نگارش ۲.۴.۰ ویژه اندروید</p>
              </div>
            </div>
          </div>
        )}

        {/* FULL ARTICLE READER SCREEN (نمای تمام‌صفحه مطالعه خبر در اندروید) */}
        {readingArticle && (
          <div className="absolute inset-0 bg-white z-40 flex flex-col animate-slideUp overflow-hidden">
            {/* Top Bar with Back, Text Zoom, Share, Bookmark */}
            <header className="bg-[#145f4c] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition"
                  aria-label="بازگشت"
                >
                  <ChevronRight size={22} />
                </button>
                <span className="text-xs font-bold truncate max-w-[170px]">
                  {readingArticle.category}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {/* Font Size Tuner */}
                <div className="flex items-center bg-white/15 rounded-lg px-2 py-0.5 text-[11px] gap-1.5">
                  <button
                    onClick={() => setFontSizeMultiplier(m => Math.max(0.85, m - 0.1))}
                    className="hover:text-amber-200 font-bold"
                    title="کاهش اندازه متن"
                  >
                    A-
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    onClick={() => setFontSizeMultiplier(m => Math.min(1.4, m + 0.1))}
                    className="hover:text-amber-200 font-bold"
                    title="افزایش اندازه متن"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() => toggleBookmark(readingArticle.id)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                  aria-label="نشانه‌گذاری"
                >
                  <Bookmark
                    size={18}
                    fill={bookmarks.includes(readingArticle.id) ? 'white' : 'none'}
                  />
                </button>

                <button
                  onClick={() => handleShare(readingArticle)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                  aria-label="اشتراک‌گذاری"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </header>

            {/* Article Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-thin">
              {/* Category & Date Metadata */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium text-[11px]">
                    {readingArticle.category}
                  </span>
                  {readingArticle.vip && (
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold text-[11px] flex items-center gap-1">
                      <Crown size={12} /> محتوای ویژه
                    </span>
                  )}
                </div>
                <span>{new Date(readingArticle.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>

              {/* Title */}
              <h1
                className="font-black text-neutral-900 leading-snug"
                style={{ fontSize: `${20 * fontSizeMultiplier}px` }}
              >
                {readingArticle.title}
              </h1>

              {/* Author & Stats */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 py-2 border-y border-neutral-100">
                <span>نویسنده و گزارشگر: <b>{readingArticle.author}</b></span>
                <span className="flex items-center gap-1">
                  <Eye size={13} /> {fa(readingArticle.views || 890)} بازدید
                </span>
              </div>

              {/* Lead Paragraph */}
              <div
                className="bg-emerald-50/70 p-3.5 rounded-xl text-emerald-950 font-medium leading-relaxed border-r-3 border-emerald-600"
                style={{ fontSize: `${14 * fontSizeMultiplier}px` }}
              >
                {readingArticle.description}
              </div>

              {/* Body Content */}
              <div
                className="text-neutral-800 leading-loose space-y-3.5"
                style={{ fontSize: `${14.5 * fontSizeMultiplier}px` }}
              >
                {readingArticle.content ? (
                  readingArticle.content.split('\n').map((para, i) => (
                    para.trim() ? <p key={i}>{para}</p> : null
                  ))
                ) : (
                  <p>
                    متن مشروح این گزارش توسط خبرنگاران سرویس {readingArticle.category} خبرگزاری خبرفوری در حال آماده‌سازی و به‌روزرسانی لحظه‌ای است. برای دریافت آخرین اطلاعات پیگیر اخبار آتی باشید.
                  </p>
                )}
              </div>

              {/* Reaction Bar */}
              <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
                <button
                  onClick={() => toggleLike(readingArticle.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    likedArticles[readingArticle.id]
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Heart
                    size={16}
                    fill={likedArticles[readingArticle.id] ? 'currentColor' : 'none'}
                  />
                  <span>
                    {likedArticles[readingArticle.id] ? 'پسندیده شد' : 'می‌پسندم'} ({fa((readingArticle.views ? Math.floor(readingArticle.views / 25) : 12) + (likeCounts[readingArticle.id] || 0))})
                  </span>
                </button>

                <button
                  onClick={() => handleShare(readingArticle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition"
                >
                  <Share2 size={15} />
                  <span>اشتراک خبر</span>
                </button>
              </div>

              {/* Comments & Discussion Section */}
              <section className="mt-6 pt-4 border-t border-neutral-200 space-y-3">
                <h3 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <MessageSquare size={15} className="text-emerald-700" />
                  دیدگاه‌های کاربران ({fa((commentsMap[readingArticle.id] || []).length)})
                </h3>

                {/* Submit comment form */}
                <form onSubmit={handleSendComment} className="space-y-2">
                  <textarea
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="دیدگاه یا نظر خود را درباره این گزارش بنویسید..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none resize-none bg-neutral-50"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="bg-[#145f4c] hover:bg-[#0f4d3d] disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                    >
                      <Send size={13} /> ارسال نظر
                    </button>
                  </div>
                </form>

                {/* Existing comments */}
                <div className="space-y-2 pt-2">
                  {(commentsMap[readingArticle.id] || []).map(c => (
                    <div key={c.id} className="bg-neutral-50 p-2.5 rounded-xl text-xs space-y-1 border border-neutral-100">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="font-bold text-neutral-800">{c.author}</span>
                        <span>{c.time}</span>
                      </div>
                      <p className="text-neutral-700 leading-relaxed">{c.body}</p>
                    </div>
                  ))}

                  {(!commentsMap[readingArticle.id] || commentsMap[readingArticle.id].length === 0) && (
                    <p className="text-xs text-neutral-400 text-center py-2">
                      اولین دیدگاه را شما ارسال کنید.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS DIALOG */}
        {notificationsOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-xl space-y-3 animate-scaleUp">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                  <Bell size={16} className="text-emerald-700" />
                  اعلان‌های خبرفوری
                </h3>
                <button onClick={() => setNotificationsOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-neutral-800">{n.title}</h4>
                      <span className="text-[10px] text-neutral-400">{n.time}</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed text-[11px]">{n.body}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  toast.success('همه اعلان‌ها خوانده شدند');
                  setNotificationsOpen(false);
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold"
              >
                تایید و بستن
              </button>
            </div>
          </div>
        )}

        {/* NEW MESSAGE TO EDITOR MODAL */}
        {messageModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-xl space-y-3 animate-scaleUp">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-emerald-700" />
                  ارسال سوژه یا پیام به سردبیر
                </h3>
                <button onClick={() => setMessageModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendMessageToEditor} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">نوع پیام</label>
                  <select
                    value={newMsgType}
                    onChange={e => setNewMsgType(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="IDEA">پیشنهاد سوژه خبری</option>
                    <option value="REPORT">ارسال گزارش میدانی</option>
                    <option value="REVIEW">درخواست بازبینی خبر</option>
                    <option value="MESSAGE">پیام عمومی به تحریریه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">عنوان پیام</label>
                  <input
                    type="text"
                    required
                    value={newMsgSubject}
                    onChange={e => setNewMsgSubject(e.target.value)}
                    placeholder="موضوع خلاصه پیام شما..."
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">متن مشروح پیام</label>
                  <textarea
                    required
                    rows={4}
                    value={newMsgBody}
                    onChange={e => setNewMsgBody(e.target.value)}
                    placeholder="شرح رویداد یا پیشنهاد خود را با جزییات بنویسید..."
                    className="w-full p-2 border border-neutral-300 rounded-lg text-xs resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#145f4c] hover:bg-[#0f4d3d] text-white rounded-xl font-bold flex items-center justify-center gap-1"
                  >
                    <Send size={14} /> ارسال به تحریریه
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageModalOpen(false)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-medium"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Toaster position="bottom-center" richColors dir="rtl" />
    </div>
  );
}
