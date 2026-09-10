import 'package:flutter_test/flutter_test.dart';
import 'package:khabarfori/features/news/domain/article.dart';
void main() {
  test('VIP preview does not assume content or access', () {
    final article = Article.fromJson({'id': 'a', 'title': 'عنوان', 'vip': true, 'locked': true});
    expect(article.content, isEmpty);
    expect(article.locked, isTrue);
    expect(article.vip, isTrue);
  });
}
