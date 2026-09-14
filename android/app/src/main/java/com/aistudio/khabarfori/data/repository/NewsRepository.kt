package com.aistudio.khabarfori.data.repository

import com.aistudio.khabarfori.data.local.ArticleDao
import com.aistudio.khabarfori.data.local.ArticleEntity
import com.aistudio.khabarfori.data.models.Article
import com.aistudio.khabarfori.data.models.Channel
import com.aistudio.khabarfori.data.models.Comment
import com.aistudio.khabarfori.data.models.EditorMessage
import com.aistudio.khabarfori.data.models.StaffMember
import com.aistudio.khabarfori.data.models.SubscriptionPlan
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class NewsRepository(private val articleDao: ArticleDao) {

    fun getArticles(): Flow<List<Article>> =
        articleDao.getAllArticles().map { entities -> entities.map { it.toArticle() } }

    fun getArticlesByCategory(cat: String): Flow<List<Article>> =
        if (cat == "همه اخبار") getArticles()
        else articleDao.getArticlesByCategory(cat).map { entities -> entities.map { it.toArticle() } }

    fun getBookmarks(): Flow<List<Article>> =
        articleDao.getBookmarkedArticles().map { entities -> entities.map { it.toArticle() } }

    suspend fun toggleBookmark(id: String, current: Boolean) {
        articleDao.setBookmark(id, !current)
    }

    suspend fun toggleLike(id: String, current: Boolean) {
        val delta = if (current) -1 else 1
        articleDao.updateLikes(id, delta, !current)
    }

    suspend fun seedInitialData() {
        val initial = listOf(
            ArticleEntity(
                id = "1",
                title = "بسته جدید ارزی بانک مرکزی و آغاز عرضه ارز تجاری در سامانه یکپارچه",
                description = "جزئیات تصمیمات جدید شورای پول و اعتبار پیرامون تسهیل صادرات غیرنفتی و مدیریت بهینه منابع ارزی کشور.",
                content = "به گزارش خبرگزاری خبرفوری، بانک مرکزی جمهوری اسلامی ایران در راستای تعادل‌بخشی به بازار ارز و تسهیل بازگشت ارز حاصل از صادرات، سازوکار معاملاتی جدیدی را از صبح امروز آغاز کرد. بر اساس این طرح، فعالان اقتصادی می‌توانند ارزهای خود را بر مبنای نرخ توافقی و با شفافیت کامل در شبکه صرافی‌های مجاز و بانکی عرضه نمایند. کارشناسان اقتصادی معتقدند این تصمیم اثرات مثبتی بر مهار انتظارات تورمی بر جای خواهد گذاشت.",
                author = "سرویس اقتصادی خبرفوری",
                category = "اقتصاد",
                status = "PUBLISHED",
                vip = true,
                views = 4250,
                createdAt = "2026-09-12T08:30:00Z",
                isBookmarked = true,
                likesCount = 145,
                isLiked = true
            ),
            ArticleEntity(
                id = "2",
                title = "گام نوین در زیست‌بوم هوش مصنوعی کشور: رونمایی از مدل‌های پردازش زبان طبیعی فارسی",
                description = "مراسم رونمایی از دستاوردهای پژوهشگران ایرانی در عرصه هوش مصنوعی مولد با حضور اساتید دانشگاهی برگزار شد.",
                content = "سرویس فناوری خبرفوری - صبح امروز در محل صندوق نوآوری و شکوفایی، از جدیدترین مدل‌های زبانی بزرگ آموزش‌دیده روی داده‌های معتبر فارسی رونمایی شد. این مدل‌ها به سازمان‌ها و کسب‌وکارهای دانش‌بنیان اجازه می‌دهند سامانه‌های پاسخگویی و تحلیلی هوشمند را با امنیت بالا و بدون وابستگی به زیرساخت‌های خارجی پیاده‌سازی نمایند.",
                author = "تحریریه علم و فناوری",
                category = "فناوری",
                status = "PUBLISHED",
                vip = false,
                views = 3100,
                createdAt = "2026-09-12T07:15:00Z",
                isBookmarked = false,
                likesCount = 89,
                isLiked = false
            ),
            ArticleEntity(
                id = "3",
                title = "گزارش میدانی از روند نوسازی ناوگان حمل‌ونقل عمومی کلانشهرها",
                description = "تحویل اتوبوس‌های برقی جدید و توسعه خطوط مترو در پایتخت و سایر مراکز استان‌ها.",
                content = "سرویس جامعه خبرفوری - با ورود نخستین محموله اتوبوس‌های پاک به مدار بهره‌برداری، شهروندان در خطوط پرتردد کلانشهرها شاهد کاهش محسوسی در زمان انتظار ایستگاه‌ها هستند. مسئولان وعده داده‌اند تا پایان سال بیش از ۱۰۰۰ دستگاه وسیله نقلیه برقی به شبکه افزوده شود.",
                author = "مریم حسینی",
                category = "جامعه",
                status = "PUBLISHED",
                vip = false,
                views = 1980,
                createdAt = "2026-09-11T14:40:00Z",
                isBookmarked = true,
                likesCount = 62,
                isLiked = false
            ),
            ArticleEntity(
                id = "4",
                title = "تحلیل روند مذاکرات منطقه‌ای و توسعه کریدورهای ترانزیتی شمال-جنوب",
                description = "بررسی جایگاه ژئوپلیتیک کشور در نقشه تجارت بین‌المللی و همکاری‌های راهبردی همسایگان.",
                content = "سرویس بین‌الملل خبرفوری - فعال‌سازی حداکثری کریدور شمال-جنوب نه تنها زمان حمل کالا میان آسیا و اروپا را به نصف کاهش می‌دهد، بلکه درآمدهای ترانزیتی پایداری را عاید کشورهای مسیر می‌سازد.",
                author = "دکتر وحید کمالی",
                category = "بین‌الملل",
                status = "PUBLISHED",
                vip = true,
                views = 5600,
                createdAt = "2026-09-11T11:20:00Z",
                isBookmarked = false,
                likesCount = 210,
                isLiked = false
            )
        )
        articleDao.insertArticles(initial)
    }

    fun getOfficialChannels(): List<Channel> = listOf(
        Channel("کانال اصلی تلگرام خبرفوری", "@AkhbareFori", "https://t.me/AkhbareFori", "۳.۴ میلیون عضو", "telegram"),
        Channel("کانال رسمی بله", "khabarfori", "https://ble.ir/khabarfori", "۱.۸ میلیون عضو", "bale"),
        Channel("کانال رسمی ایتا", "khabarfori", "https://eitaa.com/khabarfori", "۲.۵ میلیون عضو", "eitaa"),
        Channel("صفحه اینستاگرام خبرفوری", "@akhbare.fori", "https://instagram.com/akhbare.fori", "۴.۱ میلیون دنبال‌کننده", "instagram"),
        Channel("کانال روبیکا خبرفوری", "khabarfori", "https://rubika.ir/khabarfori", "۳.۰ میلیون عضو", "rubika"),
        Channel("کانال آپارات خبرفوری", "khabarfori", "https://aparat.com/khabarfori", "۶۵۰ هزار دنبال‌کننده", "aparat")
    )

    fun getSubscriptionPlans(): List<SubscriptionPlan> = listOf(
        SubscriptionPlan(
            id = "plan_1m",
            name = "اشتراک ماهانه",
            price = "۴۹,۰۰۰",
            months = 1,
            features = listOf("دسترسی به مقالات و دیدگاه‌های ویژه", "مطالعه بدون تبلیغات", "اعلان اختصاصی اخبار فوری اقتصادی"),
            isRecommended = false
        ),
        SubscriptionPlan(
            id = "plan_3m",
            name = "اشتراک فصلنامه (۳ ماهه)",
            price = "۱۲۹,۰۰۰",
            months = 3,
            features = listOf("تمام امکانات ماهانه", "دسترسی به خبرنامه محرمانه تحلیلی", "تخفیف ۲۰ درصدی نسبت به ماهانه"),
            isRecommended = true
        ),
        SubscriptionPlan(
            id = "plan_12m",
            name = "اشتراک سالانه طلایی",
            price = "۳۹۹,۰۰۰",
            months = 12,
            features = listOf("دسترسی نامحدود VIP به کلیه آرشیوها", "پشتیبانی اختصاصی دفتر سردبیر", "تخفیف ویژه و هدایای دیجیتال"),
            isRecommended = false
        )
    )

    fun getStaff(): List<StaffMember> = listOf(
        StaffMember("s1", "محمدرضا سلطانی", "سردبیر کل", "تحریریه ارشد", "soltani@khabarfori.com", "مدیریت خط‌مشی رسانه‌ای و تولید محتوای راهبردی"),
        StaffMember("s2", "مریم افشار", "دبیر سرویس اقتصادی", "سرویس اقتصاد", "afshar@khabarfori.com", "پوشش تخصصی بازارهای مالی، بورس و سیاست‌های پولی"),
        StaffMember("s3", "کامران مرادی", "دبیر سرویس فناوری", "فناوری و نوآوری", "moradi@khabarfori.com", "تحلیلگر هوش مصنوعی و اقتصاد دیجیتال"),
        StaffMember("s4", "زهرا سعیدی", "دبیر اخبار اجتماعی", "جامعه و سلامت", "saeedi@khabarfori.com", "گزارشگر میدانی و آسیب‌های شهری")
    )
}
