package com.aistudio.khabarfori.data.models

data class Article(
    val id: String,
    val title: String,
    val description: String,
    val content: String,
    val author: String,
    val category: String,
    val status: String,
    val vip: Boolean = false,
    val views: Int = 0,
    val createdAt: String,
    val isBookmarked: Boolean = false,
    val likesCount: Int = 0,
    val isLiked: Boolean = false
)

data class Comment(
    val id: String,
    val articleId: String,
    val author: String,
    val body: String,
    val timeAgo: String
)

data class Channel(
    val name: String,
    val handle: String,
    val url: String,
    val subscribers: String,
    val iconName: String
)

data class SubscriptionPlan(
    val id: String,
    val name: String,
    val price: String,
    val months: Int,
    val features: List<String>,
    val isRecommended: Boolean = false
)

data class EditorMessage(
    val id: String,
    val subject: String,
    val body: String,
    val sender: String,
    val type: String, // IDEA, REPORT, REVIEW, MESSAGE
    val status: String, // NEW, REVIEWING, COMPLETED
    val reply: String? = null,
    val createdAt: String
)

data class StaffMember(
    val id: String,
    val fullName: String,
    val position: String,
    val department: String,
    val email: String,
    val bio: String
)
