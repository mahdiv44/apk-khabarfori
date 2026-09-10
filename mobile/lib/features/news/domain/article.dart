class Article {
  final String id, title, description, content, category, author;
  final String? coverImage;
  final bool vip, locked;
  final int views;
  const Article({required this.id, required this.title, required this.description, required this.content, required this.category, required this.author, this.coverImage, required this.vip, required this.locked, required this.views});
  factory Article.fromJson(Map<String, dynamic> j) => Article(id: j['id'] as String, title: j['title'] as String, description: j['description'] as String? ?? '', content: j['content'] as String? ?? '', category: j['category'] as String? ?? '', author: j['author'] as String? ?? '', coverImage: j['coverImage'] as String?, vip: j['vip'] == true, locked: j['locked'] == true, views: j['views'] as int? ?? 0);
}
class NewsPage {
  final List<Article> items;
  final String? nextCursor;
  const NewsPage(this.items, this.nextCursor);
}
abstract class NewsRepository {
  Future<NewsPage> list({String? category, String? query, String? cursor, bool vipOnly = false});
  Future<Article> detail(String id);
  Future<void> bookmark(String id);
}
