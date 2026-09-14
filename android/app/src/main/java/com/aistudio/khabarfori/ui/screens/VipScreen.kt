package com.aistudio.khabarfori.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.khabarfori.ui.theme.ForestGreen40
import com.aistudio.khabarfori.ui.theme.Gold40
import com.aistudio.khabarfori.ui.viewmodel.NewsViewModel

@Composable
fun VipScreen(
    viewModel: NewsViewModel,
    modifier: Modifier = Modifier
) {
    val plans = viewModel.subscriptionPlans

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        contentPadding = PaddingValues(bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(Color(0xFF0F3D30), Color(0xFF145F4C), Color(0xFF1B7D64))
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "VIP",
                            tint = Gold40,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "اشتراک ویژه خبرفوری (VIP)",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "دسترسی بی‌محدود به تحلیل‌های نخبگان، یادداشت‌های محرمانه و تجربه مطالعه بدون تبلیغات",
                            color = Color(0xFFD4EDE4),
                            fontSize = 13.sp,
                            lineHeight = 20.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        }

        items(plans) { plan ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (plan.isRecommended) Color(0xFFF1FAF6) else MaterialTheme.colorScheme.surface
                ),
                border = if (plan.isRecommended) CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(ForestGreen40, Gold40))) else null,
                elevation = CardDefaults.cardElevation(defaultElevation = if (plan.isRecommended) 4.dp else 1.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    if (plan.isRecommended) {
                        Surface(
                            color = ForestGreen40,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "پیشنهاد ویژه تحریریه",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    Text(
                        text = plan.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "${plan.price} تومان",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = ForestGreen40
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    plan.features.forEach { feat ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 3.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                tint = ForestGreen40,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = feat,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = { /* Simulated Checkout */ },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (plan.isRecommended) ForestGreen40 else MaterialTheme.colorScheme.secondary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(text = "فعال‌سازی این اشتراک", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
