package com.aistudio.khabarfori.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aistudio.khabarfori.data.models.Article
import com.aistudio.khabarfori.data.models.Channel
import com.aistudio.khabarfori.data.models.EditorMessage
import com.aistudio.khabarfori.data.models.StaffMember
import com.aistudio.khabarfori.data.models.SubscriptionPlan
import com.aistudio.khabarfori.data.repository.NewsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface NewsUiState {
    data object Loading : NewsUiState
    data class Success(val articles: List<Article>) : NewsUiState
    data class Error(val message: String) : NewsUiState
}

class NewsViewModel(private val repository: NewsRepository) : ViewModel() {

    private val _selectedCategory = MutableStateFlow("همه اخبار")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedArticle = MutableStateFlow<Article?>(null)
    val selectedArticle: StateFlow<Article?> = _selectedArticle.asStateFlow()

    val articles: StateFlow<List<Article>> = combine(
        repository.getArticles(),
        _selectedCategory,
        _searchQuery
    ) { allArticles, category, query ->
        allArticles.filter { article ->
            val matchesCategory = category == "همه اخبار" || article.category == category
            val matchesQuery = query.isBlank() ||
                    article.title.contains(query, ignoreCase = true) ||
                    article.description.contains(query, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val bookmarkedArticles: StateFlow<List<Article>> = repository.getBookmarks()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val officialChannels: List<Channel> = repository.getOfficialChannels()
    val subscriptionPlans: List<SubscriptionPlan> = repository.getSubscriptionPlans()
    val staffMembers: List<StaffMember> = repository.getStaff()

    private val _editorMessages = MutableStateFlow<List<EditorMessage>>(
        listOf(
            EditorMessage(
                id = "m1",
                subject = "پیشنهاد گزارش تحلیلی بازار مسکن و اجاره‌بها",
                body = "با توجه به فصل جابه‌جایی مستأجران، پیشنهاد بررسی میدانی تأثیر سامانه‌های خودنویس بر تثبیت قیمت‌ها را دارم.",
                sender = "شهروند خبرنگار",
                type = "IDEA",
                status = "COMPLETED",
                reply = "با تشکر از دیدگاه ارزشمند شما، این سوژه به سرویس اقتصادی ارجاع و گزارش میدانی آن در دست تهیه است.",
                createdAt = "۱۴۰۵/۰۲/۱۵"
            ),
            EditorMessage(
                id = "m2",
                subject = "ارسال تصاویر افتتاح ایستگاه جدید مترو",
                body = "تصاویر باکیفیت از رضایت شهروندان از ایستگاه تجریش-قیطریه پیوست گردید.",
                sender = "عکاس آزاد",
                type = "REPORT",
                status = "REVIEWING",
                reply = null,
                createdAt = "۱۴۰۵/۰۲/۱۸"
            )
        )
    )
    val editorMessages: StateFlow<List<EditorMessage>> = _editorMessages.asStateFlow()

    init {
        viewModelScope.launch {
            repository.seedInitialData()
        }
    }

    fun selectCategory(category: String) {
        _selectedCategory.value = category
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun selectArticle(article: Article?) {
        _selectedArticle.value = article
    }

    fun toggleBookmark(article: Article) {
        viewModelScope.launch {
            repository.toggleBookmark(article.id, article.isBookmarked)
        }
    }

    fun toggleLike(article: Article) {
        viewModelScope.launch {
            repository.toggleLike(article.id, article.isLiked)
        }
    }

    fun submitMessage(subject: String, body: String, type: String) {
        val newMessage = EditorMessage(
            id = "m_${System.currentTimeMillis()}",
            subject = subject,
            body = body,
            sender = "کاربر همراه خبرفوری",
            type = type,
            status = "NEW",
            reply = null,
            createdAt = "امروز"
        )
        _editorMessages.value = listOf(newMessage) + _editorMessages.value
    }
}
