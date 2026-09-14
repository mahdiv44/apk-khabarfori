package com.aistudio.khabarfori.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.khabarfori.data.models.Article
import com.aistudio.khabarfori.ui.theme.ForestGreen40
import com.aistudio.khabarfori.ui.theme.Gold40
import com.aistudio.khabarfori.ui.viewmodel.NewsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleDetailScreen(
    article: Article,
    viewModel: NewsViewModel,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var fontScale by remember { mutableFloatStateOf(1.0f) }
    var commentText by remember { mutableStateOf("") }
    val comments = remember {
        mutableStateListOf(
            "تحلیل بسیار جامع و مفیدی بود، سپاس از گروه رسانه‌ای خبرفوری.",
            "امیدواریم نهادهای متولی این پیشنهادها را به سرعت در دستور کار قرار دهند."
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = article.category,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick, modifier = Modifier.testTag("back_button")) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "بازگشت"
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { fontScale = (fontScale + 0.1f).coerceAtMost(1.4f) }) {
                        Icon(imageVector = Icons.Default.FormatSize, contentDescription = "اندازه قلم")
                    }
                    IconButton(onClick = { viewModel.toggleBookmark(article) }) {
                        Icon(
                            imageVector = if (article.isBookmarked) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
                            contentDescription = "ذخیره خبر",
                            tint = if (article.isBookmarked) Gold40 else Color.White
                        )
                    }
                    IconButton(onClick = { /* Share */ }) {
                        Icon(imageVector = Icons.Default.Share, contentDescription = "اشتراک‌گذاری")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ForestGreen40,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Category & Metadata
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = ForestGreen40.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = article.category,
                        color = ForestGreen40,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Text(
                    text = "${article.views} بازدید",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.outline
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Headline
            Text(
                text = article.title,
                fontSize = (20 * fontScale).sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface,
                lineHeight = (28 * fontScale).sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "نویسنده: ${article.author}",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.outline
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Lead Paragraph
            Surface(
                color = Color(0xFFF1F8F4),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = article.description,
                    fontSize = (14 * fontScale).sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF144D3E),
                    lineHeight = (22 * fontScale).sp,
                    modifier = Modifier.padding(14.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Story Body
            Text(
                text = article.content,
                fontSize = (15 * fontScale).sp,
                color = MaterialTheme.colorScheme.onSurface,
                lineHeight = (26 * fontScale).sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Reactions Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = { viewModel.toggleLike(article) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (article.isLiked) Color(0xFFFFEAEA) else Color(0xFFF0F4F2),
                        contentColor = if (article.isLiked) Color(0xFFD32F2F) else ForestGreen40
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = if (article.isLiked) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "پسندیدن"
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "می‌پسندم (${article.likesCount})", fontSize = 13.sp)
                }

                OutlinedButton(
                    onClick = { /* Share */ },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.Share, contentDescription = "اشتراک")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("اشتراک‌گذاری خبر")
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            Divider()
            Spacer(modifier = Modifier.height(16.dp))

            // Comments Section
            Text(
                text = "دیدگاه‌های مخاطبان (${comments.size})",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = commentText,
                onValueChange = { commentText = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("دیدگاه شما درباره این خبر...", fontSize = 13.sp) },
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {
                    if (commentText.isNotBlank()) {
                        comments.add(0, commentText)
                        commentText = ""
                    }
                },
                enabled = commentText.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreen40),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Icon(imageVector = Icons.Default.Send, contentDescription = "ارسال")
                Spacer(modifier = Modifier.width(6.dp))
                Text("ثبت دیدگاه")
            }

            Spacer(modifier = Modifier.height(16.dp))

            comments.forEach { c ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAF9)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "کاربر خبرفوری",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = ForestGreen40
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = c,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}
