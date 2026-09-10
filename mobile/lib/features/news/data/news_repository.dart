import '../../../core/api.dart';
import '../domain/article.dart';
class ApiNewsRepository implements NewsRepository {
  final Api api;
  ApiNewsRepository(this.api);
  @override
  Future<NewsPage> list({String? category, String? query, String? cursor, bool vipOnly = false}) async {
    final data = await api.get('/news', query: {if (category != null) 'category': category, if (query != null) 'q': query, if (cursor != null) 'cursor': cursor, if (vipOnly) 'vip': 'true'});
    return NewsPage((data['items'] as List).map((j) => Article.fromJson(Map<String, dynamic>.from(j))).toList(), data['nextCursor'] as String?);
  }
  @override Future<Article> detail(String id) async => Article.fromJson(Map<String, dynamic>.from(await api.get('/news/$id')));
  @override Future<void> bookmark(String id) async { await api.send('/bookmarks/$id'); }
}
