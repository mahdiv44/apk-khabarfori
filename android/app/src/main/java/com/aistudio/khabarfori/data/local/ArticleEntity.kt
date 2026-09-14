package com.aistudio.khabarfori.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.aistudio.khabarfori.data.models.Article

@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val content: String,
    val author: String,
    val category: String,
    val status: String,
    val vip: Boolean,
    val views: Int,
    val createdAt: String,
    val isBookmarked: Boolean = false,
    val likesCount: Int = 0,
    val isLiked: Boolean = false
) {
    fun toArticle(): Article = Article(
        id = id,
        title = title,
        description = description,
        content = content,
        author = author,
        category = category,
        status = status,
        vip = vip,
        views = views,
        createdAt = createdAt,
        isBookmarked = isBookmarked,
        likesCount = likesCount,
        isLiked = isLiked
    )

    companion object {
        fun fromArticle(article: Article): ArticleEntity = ArticleEntity(
            id = article.id,
            title = article.title,
            description = article.description,
            content = article.content,
            author = article.author,
            category = article.category,
            status = article.status,
            vip = article.vip,
            views = article.views,
            createdAt = article.createdAt,
            isBookmarked = article.isBookmarked,
            likesCount = article.likesCount,
            isLiked = article.isLiked
        )
    }
}
