import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:khabarfori/screens.dart';
import 'package:khabarfori/features/news/domain/article.dart';
void main() {
  testWidgets('news card renders Persian title and premium marker', (tester) async {
    const article = Article(id: 'news-id', title: 'آینده رسانه', description: 'شرح کوتاه', content: '', category: 'فناوری', author: 'تحریریه', vip: true, locked: true, views: 0);
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: Directionality(textDirection: TextDirection.rtl, child: NewsCard(article: article)))));
    expect(find.text('آینده رسانه'), findsOneWidget);
    expect(find.byIcon(Icons.workspace_premium), findsOneWidget);
  });
}
