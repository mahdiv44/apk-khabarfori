package com.aistudio.khabarfori

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aistudio.khabarfori.data.local.AppDatabase
import com.aistudio.khabarfori.data.models.Article
import com.aistudio.khabarfori.data.repository.NewsRepository
import com.aistudio.khabarfori.ui.screens.*
import com.aistudio.khabarfori.ui.theme.ForestGreen40
import com.aistudio.khabarfori.ui.theme.KhabarForiTheme
import com.aistudio.khabarfori.ui.viewmodel.NewsViewModel

enum class Screen(val title: String, val icon: ImageVector) {
    HOME("اخبار", Icons.Default.Newspaper),
    VIP("دیدگاه ویژه", Icons.Default.Star),
    CHANNELS("کانال‌ها", Icons.Default.RssFeed),
    MESSAGES("سردبیر", Icons.Default.Message),
    PROFILE("حساب من", Icons.Default.Person)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = AppDatabase.getDatabase(this)
        val repository = NewsRepository(database.articleDao())

        setContent {
            KhabarForiTheme {
                val newsViewModel = remember { NewsViewModel(repository) }
                KhabarForiApp(newsViewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KhabarForiApp(viewModel: NewsViewModel) {
    var currentScreen by remember { mutableStateOf(Screen.HOME) }
    val selectedArticle by viewModel.selectedArticle.collectAsState()
    var searchOpen by remember { mutableStateOf(false) }
    val searchQuery by viewModel.searchQuery.collectAsState()

    if (selectedArticle != null) {
        ArticleDetailScreen(
            article = selectedArticle!!,
            viewModel = viewModel,
            onBackClick = { viewModel.selectArticle(null) }
        )
    } else {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        if (searchOpen) {
                            TextField(
                                value = searchQuery,
                                onValueChange = { viewModel.updateSearchQuery(it) },
                                placeholder = { Text("جست‌وجو در اخبار...") },
                                colors = TextFieldDefaults.colors(
                                    focusedContainerColor = Color.Transparent,
                                    unfocusedContainerColor = Color.Transparent,
                                    focusedIndicatorColor = Color.Transparent,
                                    unfocusedIndicatorColor = Color.Transparent,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )
                        } else {
                            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                                Text(
                                    text = "خبرفوری",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    color = Color(0xFF1B7D64),
                                    shape = androidx.compose.foundation.shape.RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "اندروید",
                                        color = Color(0xFFDCFCE7),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = { searchOpen = !searchOpen }) {
                            Icon(
                                imageVector = if (searchOpen) Icons.Default.Close else Icons.Default.Search,
                                contentDescription = "جست‌وجو"
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = ForestGreen40,
                        titleContentColor = Color.White,
                        actionIconContentColor = Color.White
                    )
                )
            },
            bottomBar = {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.testTag("bottom_nav_bar")
                ) {
                    Screen.values().forEach { screen ->
                        NavigationBarItem(
                            selected = currentScreen == screen,
                            onClick = {
                                currentScreen = screen
                                viewModel.selectArticle(null)
                            },
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title, fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ForestGreen40,
                                selectedTextColor = ForestGreen40,
                                indicatorColor = Color(0xFFDCFCE7)
                            )
                        )
                    }
                }
            }
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                when (currentScreen) {
                    Screen.HOME -> HomeScreen(
                        viewModel = viewModel,
                        onArticleClick = { viewModel.selectArticle(it) }
                    )
                    Screen.VIP -> VipScreen(viewModel = viewModel)
                    Screen.CHANNELS -> ChannelsScreen(viewModel = viewModel)
                    Screen.MESSAGES -> MessagesScreen(viewModel = viewModel)
                    Screen.PROFILE -> ProfileScreen(
                        viewModel = viewModel,
                        onArticleClick = { viewModel.selectArticle(it) }
                    )
                }
            }
        }
    }
}
