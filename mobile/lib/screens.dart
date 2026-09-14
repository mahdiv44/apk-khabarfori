import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'core/api.dart';
import 'core/brand.dart';
import 'features/news/domain/article.dart';
import 'features/news/presentation/providers.dart';
void notice(BuildContext context, String text) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text))); }
void open(BuildContext context, Widget screen) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
class ErrorView extends StatelessWidget {
  final Object error; final VoidCallback retry;
  const ErrorView({super.key, required this.error, required this.retry});
  @override Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.cloud_off, size: 40), const SizedBox(height: 16), Text(errorMessage(error), textAlign: TextAlign.center), const SizedBox(height: 16), FilledButton(onPressed: retry, child: const Text('تلاش دوباره')), TextButton(onPressed: () => open(context, const LoginScreen()), child: const Text('ورود به حساب'))])));
}
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override ConsumerState<HomeScreen> createState() => _HomeState();
}
class _HomeState extends ConsumerState<HomeScreen> {
  int tab = 0;
  @override Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Image.asset(brandLogo, height: 45, semanticLabel: 'خبرفوری'), actions: [IconButton(tooltip: 'اعلان‌ها', onPressed: () => open(context, const NotificationsScreen()), icon: const Icon(Icons.notifications_outlined))]),
    drawer: Drawer(child: SafeArea(child: ListView(children: [Padding(padding: const EdgeInsets.all(24), child: Image.asset(brandLogo, height: 90)), ListTile(leading: const Icon(Icons.public), title: const Text('کانال‌های خبرفوری'), onTap: () { Navigator.pop(context); open(context, const OfficialChannelsScreen()); }), ListTile(leading: const Icon(Icons.people_outline), title: const Text('همکاران سازمان'), onTap: () { Navigator.pop(context); open(context, const EmployeesScreen()); }), ListTile(leading: const Icon(Icons.chat_outlined), title: const Text('ارتباط با سردبیر'), onTap: () { Navigator.pop(context); open(context, const MessagesScreen()); }), ListTile(leading: const Icon(Icons.bookmark_outline), title: const Text('ذخیره‌ها'), onTap: () { Navigator.pop(context); open(context, const BookmarksScreen()); }), ListTile(leading: const Icon(Icons.workspace_premium_outlined), title: const Text('دیدگاه‌های ویژه'), onTap: () { Navigator.pop(context); open(context, const OpinionsScreen()); })]))),
    body: IndexedStack(index: tab, children: const [NewsScreen(), VipScreen(), ProfileScreen()]),
    bottomNavigationBar: NavigationBar(selectedIndex: tab, onDestinationSelected: (v) => setState(() => tab = v), destinations: const [NavigationDestination(icon: Icon(Icons.newspaper_outlined), selectedIcon: Icon(Icons.newspaper), label: 'اخبار'), NavigationDestination(icon: Icon(Icons.workspace_premium_outlined), label: 'اشتراک ویژه'), NavigationDestination(icon: Icon(Icons.person_outline), label: 'حساب من')]),
  );
}
class NewsScreen extends ConsumerStatefulWidget {
  const NewsScreen({super.key});
  @override ConsumerState<NewsScreen> createState() => _NewsState();
}
class _NewsState extends ConsumerState<NewsScreen> {
  Timer? debounce; final extra = <Article>[]; String? cursor; bool loading = false;
  @override void dispose() { debounce?.cancel(); super.dispose(); }
  void reset() { extra.clear(); cursor = null; }
  @override Widget build(BuildContext context) {
    final result = ref.watch(newsProvider);
    return Column(children: [Padding(padding: const EdgeInsets.all(16), child: TextField(decoration: const InputDecoration(hintText: 'جست‌وجوی خبر...', prefixIcon: Icon(Icons.search), filled: true, fillColor: Colors.white), onChanged: (v) { debounce?.cancel(); debounce = Timer(const Duration(milliseconds: 350), () { reset(); ref.read(searchProvider.notifier).state = v; }); })), SizedBox(height: 48, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), children: [null, 'سیاست', 'اقتصاد', 'جامعه', 'فناوری', 'بین‌الملل', 'فرهنگ'].map((c) => Padding(padding: const EdgeInsets.only(left: 8), child: ChoiceChip(label: Text(c ?? 'همه اخبار'), selected: ref.watch(categoryProvider) == c, onSelected: (_) { reset(); ref.read(categoryProvider.notifier).state = c; }))).toList())), Expanded(child: result.when(loading: () => const Center(child: CircularProgressIndicator()), error: (e, _) => ErrorView(error: e, retry: () => ref.invalidate(newsProvider)), data: (page) {
      final articles = [...page.items, ...extra]; final next = extra.isEmpty ? page.nextCursor : cursor;
      if (articles.isEmpty) return const Center(child: Text('خبری پیدا نشد.'));
      return RefreshIndicator(onRefresh: () async { reset(); ref.invalidate(newsProvider); await ref.read(newsProvider.future); }, child: ListView.builder(padding: const EdgeInsets.all(16), itemCount: articles.length + (next == null ? 0 : 1), itemBuilder: (context, i) {
        if (i < articles.length) return NewsCard(article: articles[i], featured: i == 0);
        return TextButton(onPressed: loading ? null : () async { setState(() => loading = true); try { final nextPage = await ref.read(newsRepositoryProvider).list(category: ref.read(categoryProvider), query: ref.read(searchProvider), cursor: next); if (mounted) setState(() { extra.addAll(nextPage.items); cursor = nextPage.nextCursor; }); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } finally { if (mounted) setState(() => loading = false); } }, child: Text(loading ? 'در حال دریافت...' : 'خبرهای بیشتر'));
      }));
    }))]);
  }
}
class NewsCard extends StatelessWidget {
  final Article article; final bool featured;
  const NewsCard({super.key, required this.article, this.featured = false});
  @override Widget build(BuildContext context) => Card(color: featured ? const Color(0xffeaf3ed) : Colors.white, margin: const EdgeInsets.only(bottom: 16), child: InkWell(borderRadius: BorderRadius.circular(12), onTap: () => open(context, ArticleScreen(id: article.id)), child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [if (article.coverImage != null) ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(article.coverImage!, height: 180, width: double.infinity, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink())), Row(children: [Chip(label: Text(article.category)), const Spacer(), if (article.vip) const Icon(Icons.workspace_premium, color: Color(0xffad8946))]), const SizedBox(height: 10), Text(article.title, style: TextStyle(fontSize: featured ? 23 : 19, fontWeight: FontWeight.bold, height: 1.7)), const SizedBox(height: 10), Text(article.description, style: const TextStyle(height: 1.9, color: Color(0xff708477))), const SizedBox(height: 18), Text(article.author, style: const TextStyle(fontSize: 12))]))));
}
class ArticleScreen extends ConsumerWidget {
  final String id;
  const ArticleScreen({super.key, required this.id});
  @override Widget build(BuildContext context, WidgetRef ref) => Scaffold(appBar: AppBar(title: const Text('خبرفوری')), body: ref.watch(articleProvider(id)).when(loading: () => const Center(child: CircularProgressIndicator()), error: (e, _) => ErrorView(error: e, retry: () => ref.invalidate(articleProvider(id))), data: (a) => ListView(padding: const EdgeInsets.all(24), children: [Text(a.category, style: const TextStyle(color: Color(0xff287354))), const SizedBox(height: 16), Text(a.title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, height: 1.7)), const SizedBox(height: 16), Text(a.author), const SizedBox(height: 20), Text(a.description, style: const TextStyle(fontSize: 19, height: 2)), const Divider(height: 40), if (a.locked) Card(child: Padding(padding: const EdgeInsets.all(24), child: Column(children: [const Icon(Icons.lock_outline, size: 35), const SizedBox(height: 14), const Text('این مطلب برای مشترکان ویژه است.'), const SizedBox(height: 14), FilledButton(onPressed: () => open(context, const Scaffold(body: SafeArea(child: VipScreen()))), child: const Text('خرید اشتراک'))]))) else Text(a.content, style: const TextStyle(fontSize: 18, height: 2.1)), const SizedBox(height: 24), Wrap(spacing: 10, children: [OutlinedButton.icon(onPressed: () async { try { await ref.read(newsRepositoryProvider).bookmark(id); if (context.mounted) notice(context, 'خبر ذخیره شد.'); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } }, icon: const Icon(Icons.bookmark_add_outlined), label: const Text('ذخیره')), OutlinedButton.icon(onPressed: () => Share.share('${a.title}\n${const String.fromEnvironment('PUBLIC_WEB_URL', defaultValue: 'https://example.com')}/?view=public&article=$id'), icon: const Icon(Icons.share_outlined), label: const Text('اشتراک‌گذاری')), OutlinedButton.icon(onPressed: () async { try { await ref.read(apiProvider).send('/news/$id/reactions'); if (context.mounted) notice(context, 'واکنش ثبت شد.'); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } }, icon: const Icon(Icons.favorite_outline), label: const Text('پسندیدن'))]), if (!a.locked) CommentsSection(id: id)])));
}
class CommentsSection extends ConsumerStatefulWidget {
  final String id; const CommentsSection({super.key, required this.id});
  @override ConsumerState<CommentsSection> createState() => _CommentsState();
}
class _CommentsState extends ConsumerState<CommentsSection> {
  final text = TextEditingController(); bool busy = false;
  @override void dispose() { text.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) { final path = '/news/${widget.id}/comments'; return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Divider(height: 45), const Text('دیدگاه مخاطبان', style: TextStyle(fontSize: 21, fontWeight: FontWeight.bold)), ref.watch(remoteProvider(path)).when(loading: () => const LinearProgressIndicator(), error: (e, _) => Padding(padding: const EdgeInsets.symmetric(vertical: 14), child: Text(errorMessage(e))), data: (data) => Column(children: (data as List).map((c) => ListTile(title: Text(c['body']), subtitle: Text(c['user']['name']))).toList())), TextField(controller: text, maxLength: 2000, maxLines: 3, decoration: const InputDecoration(labelText: 'دیدگاه شما')), FilledButton(onPressed: busy ? null : () async { if (text.text.trim().isEmpty) return; setState(() => busy = true); try { await ref.read(apiProvider).send(path, data: {'body': text.text.trim()}); text.clear(); ref.invalidate(remoteProvider(path)); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } finally { if (mounted) setState(() => busy = false); } }, child: const Text('ارسال دیدگاه'))]); }
}
class VipScreen extends ConsumerWidget {
  const VipScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => ref.watch(remoteProvider('/subscriptions/plans')).when(loading: () => const Center(child: CircularProgressIndicator()), error: (e, _) => ErrorView(error: e, retry: () => ref.invalidate(remoteProvider('/subscriptions/plans'))), data: (data) => ListView(padding: const EdgeInsets.all(24), children: [const Icon(Icons.workspace_premium, size: 46, color: Color(0xffb89852)), const SizedBox(height: 15), const Text('یک قدم جلوتر از خبر', textAlign: TextAlign.center, style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)), const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Text('تحلیل‌های اختصاصی، دیدگاه کارشناسان و یادداشت سردبیر', textAlign: TextAlign.center)), ...(data as List).map((p) => Card(child: Padding(padding: const EdgeInsets.all(23), child: Column(children: [Text('اشتراک ${p['name']}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)), const SizedBox(height: 16), Text('${(p['amount'] as num) ~/ 10} تومان', style: const TextStyle(fontSize: 25)), const SizedBox(height: 18), FilledButton(onPressed: () async { try { final result = await ref.read(apiProvider).send('/subscriptions/checkout', data: {'planId': p['id']}, headers: {'Idempotency-Key': '${DateTime.now().microsecondsSinceEpoch}-${p['id']}'}); if (result['url'] != null) await launchUrl(Uri.parse(result['url']), mode: LaunchMode.externalApplication); ref.invalidate(remoteProvider('/subscriptions/status')); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } }, child: const Text('خرید اشتراک'))])))), TextButton(onPressed: () => open(context, const PaymentsScreen()), child: const Text('وضعیت اشتراک و تاریخچه پرداخت‌ها'))]));
}
class EmployeesScreen extends ConsumerWidget {
  const EmployeesScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => RemoteScreen(title: 'همکاران سازمان', path: '/employees', builder: (data) => ListView(padding: const EdgeInsets.all(16), children: (data as List).map((e) => Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [CircleAvatar(child: Text((e['fullName'] as String).substring(0, 1))), const SizedBox(height: 15), Text(e['fullName'], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)), Text('${e['position']} · ${e['department']}'), const SizedBox(height: 15), Text(e['biography'], style: const TextStyle(height: 1.9)), TextButton.icon(onPressed: () => launchUrl(Uri(scheme: 'mailto', path: e['email'])), icon: const Icon(Icons.email_outlined), label: const Text('ارتباط'))])))).toList()));
}
class MessagesScreen extends ConsumerWidget {
  const MessagesScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => RemoteScreen(title: 'ارتباط با سردبیر', path: '/messages', action: IconButton(onPressed: () => open(context, const MessageComposeScreen()), icon: const Icon(Icons.add)), builder: (data) => (data as List).isEmpty ? const Center(child: Text('هنوز پیامی ارسال نکرده‌اید.')) : ListView(padding: const EdgeInsets.all(16), children: data.map((m) => Card(child: Padding(padding: const EdgeInsets.all(22), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(m['subject'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)), const SizedBox(height: 12), Text(m['body'], style: const TextStyle(height: 2)), Chip(label: Text({'NEW': 'جدید', 'REVIEWING': 'در حال بررسی', 'COMPLETED': 'تکمیل شده'}[m['status']] ?? m['status'])), if (m['reply'] != null) Text('پاسخ سردبیر: ${m['reply']}')])))).toList()));
}
class MessageComposeScreen extends ConsumerStatefulWidget { const MessageComposeScreen({super.key}); @override ConsumerState<MessageComposeScreen> createState() => _MessageComposeState(); }
class _MessageComposeState extends ConsumerState<MessageComposeScreen> {
  final subject = TextEditingController(), body = TextEditingController(); String type = 'IDEA'; bool busy = false;
  @override void dispose() { subject.dispose(); body.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('پیام جدید')), body: ListView(padding: const EdgeInsets.all(24), children: [TextField(controller: subject, maxLength: 200, decoration: const InputDecoration(labelText: 'موضوع')), const SizedBox(height: 15), DropdownButtonFormField<String>(initialValue: type, items: const [DropdownMenuItem(value: 'IDEA', child: Text('پیشنهاد سوژه')), DropdownMenuItem(value: 'REPORT', child: Text('ارسال گزارش')), DropdownMenuItem(value: 'REVIEW', child: Text('درخواست بازبینی')), DropdownMenuItem(value: 'MESSAGE', child: Text('پیام'))], onChanged: (v) => setState(() => type = v!)), const SizedBox(height: 20), TextField(controller: body, maxLength: 10000, maxLines: 8, decoration: const InputDecoration(labelText: 'متن پیام')), FilledButton(onPressed: busy ? null : () async { if (subject.text.trim().length < 3 || body.text.trim().length < 3) { notice(context, 'موضوع و متن پیام را تکمیل کنید.'); return; } setState(() => busy = true); try { await ref.read(apiProvider).send('/messages', data: {'subject': subject.text, 'body': body.text, 'type': type}); ref.invalidate(remoteProvider('/messages')); if (context.mounted) Navigator.pop(context); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } finally { if (mounted) setState(() => busy = false); } }, child: const Text('ارسال پیام'))]));
}
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => ref.watch(remoteProvider('/profile')).when(loading: () => const Center(child: CircularProgressIndicator()), error: (e, _) => ErrorView(error: e, retry: () => ref.invalidate(remoteProvider('/profile'))), data: (p) => ListView(padding: const EdgeInsets.all(24), children: [const CircleAvatar(radius: 38, child: Icon(Icons.person, size: 40)), const SizedBox(height: 20), Text(p['name'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 25, fontWeight: FontWeight.bold)), Text(p['email'] ?? p['phone'] ?? '', textAlign: TextAlign.center), const SizedBox(height: 25), ListTile(leading: const Icon(Icons.edit_outlined), title: const Text('ویرایش نام'), onTap: () => open(context, AccountFormScreen(title: 'ویرایش نام', path: '/profile', fields: const {'name': 'نام و نام خانوادگی'}, method: 'PATCH'))), ListTile(leading: const Icon(Icons.password), title: const Text('تغییر رمز عبور'), onTap: () => open(context, AccountFormScreen(title: 'تغییر رمز عبور', path: '/auth/password', fields: const {'currentPassword': 'رمز فعلی', 'newPassword': 'رمز جدید'}))), ListTile(leading: const Icon(Icons.notifications_outlined), title: const Text('فعال‌سازی اعلان‌ها'), onTap: () async { try { if (!const bool.fromEnvironment('ENABLE_FCM')) { notice(context, 'اعلان‌ها در این نسخه پیکربندی نشده‌اند.'); return; } await FirebaseMessaging.instance.requestPermission(); final token = await FirebaseMessaging.instance.getToken(); if (token != null) await ref.read(apiProvider).send('/notifications/devices', data: {'token': token}); if (context.mounted) notice(context, 'اعلان‌ها فعال شدند.'); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } }), ListTile(leading: const Icon(Icons.logout), title: const Text('خروج از حساب'), onTap: () async { try { await ref.read(apiProvider).send('/auth/logout'); } finally { await ref.read(apiProvider).clearSession(); ref.invalidate(remoteProvider); if (context.mounted) notice(context, 'از حساب خارج شدید.'); } })]));
}
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key}); @override ConsumerState<LoginScreen> createState() => _LoginState();
}
class _LoginState extends ConsumerState<LoginScreen> {
  final identifier = TextEditingController(), password = TextEditingController(), name = TextEditingController(); bool register = false, busy = false;
  @override void dispose() { identifier.dispose(); password.dispose(); name.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(register ? 'ثبت‌نام' : 'ورود به خبرفوری')), body: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 480), child: ListView(shrinkWrap: true, padding: const EdgeInsets.all(28), children: [const Icon(Icons.bolt, size: 60, color: Color(0xff165d49)), const SizedBox(height: 30), if (register) Padding(padding: const EdgeInsets.only(bottom: 18), child: TextField(controller: name, decoration: const InputDecoration(labelText: 'نام و نام خانوادگی'))), TextField(controller: identifier, textDirection: TextDirection.ltr, decoration: const InputDecoration(labelText: 'ایمیل یا شماره همراه با کد کشور')), const SizedBox(height: 18), TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'رمز عبور (حداقل ۱۲ کاراکتر)')), const SizedBox(height: 22), FilledButton(onPressed: busy ? null : () async { setState(() => busy = true); try { final data = await ref.read(apiProvider).send(register ? '/auth/register' : '/auth/login', data: {'identifier': identifier.text.trim(), 'password': password.text, if (register) 'name': name.text}); await ref.read(apiProvider).storeTokens(Map<String, dynamic>.from(data)); ref.invalidate(remoteProvider); if (context.mounted) Navigator.pop(context); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } finally { if (mounted) setState(() => busy = false); } }, child: Text(busy ? 'در حال بررسی...' : register ? 'ساخت حساب' : 'ورود')), TextButton(onPressed: () => setState(() => register = !register), child: Text(register ? 'حساب دارید؟ وارد شوید' : 'ساخت حساب جدید')), TextButton(onPressed: () => open(context, AccountFormScreen(title: 'بازیابی رمز عبور', path: '/auth/forgot-password', fields: const {'identifier': 'ایمیل یا شماره همراه'})), child: const Text('رمز عبور را فراموش کرده‌ام')), TextButton(onPressed: () => open(context, AccountFormScreen(title: 'ثبت رمز جدید', path: '/auth/reset-password', fields: const {'token': 'کد بازیابی', 'password': 'رمز عبور جدید'})), child: const Text('کد بازیابی دارم'))]))));
}
class AccountFormScreen extends ConsumerStatefulWidget {
  final String title, path, method; final Map<String, String> fields;
  const AccountFormScreen({super.key, required this.title, required this.path, required this.fields, this.method = 'POST'});
  @override ConsumerState<AccountFormScreen> createState() => _AccountFormState();
}
class _AccountFormState extends ConsumerState<AccountFormScreen> {
  late final Map<String, TextEditingController> fields; bool busy = false;
  @override void initState() { super.initState(); fields = {for (final k in widget.fields.keys) k: TextEditingController()}; }
  @override void dispose() { for (final c in fields.values) { c.dispose(); } super.dispose(); }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(widget.title)), body: ListView(padding: const EdgeInsets.all(24), children: [...fields.entries.map((e) => Padding(padding: const EdgeInsets.only(bottom: 18), child: TextField(controller: e.value, obscureText: e.key.toLowerCase().contains('password'), decoration: InputDecoration(labelText: widget.fields[e.key])))), FilledButton(onPressed: busy ? null : () async { setState(() => busy = true); try { final result = await ref.read(apiProvider).send(widget.path, method: widget.method, data: fields.map((k, v) => MapEntry(k, v.text))); ref.invalidate(remoteProvider); if (context.mounted) { notice(context, result is Map && result['message'] != null ? result['message'].toString() : 'اطلاعات ثبت شد.'); Navigator.pop(context); } } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } finally { if (mounted) setState(() => busy = false); } }, child: const Text('ثبت اطلاعات'))]));
}
class RemoteScreen extends ConsumerWidget {
  final String title, path; final Widget Function(dynamic) builder; final Widget? action;
  const RemoteScreen({super.key, required this.title, required this.path, required this.builder, this.action});
  @override Widget build(BuildContext context, WidgetRef ref) => Scaffold(appBar: AppBar(title: Text(title), actions: [if (action != null) action!]), body: ref.watch(remoteProvider(path)).when(loading: () => const Center(child: CircularProgressIndicator()), error: (e, _) => ErrorView(error: e, retry: () => ref.invalidate(remoteProvider(path))), data: builder));
}
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => RemoteScreen(title: 'اعلان‌ها', path: '/notifications', action: IconButton(tooltip: 'خواندن همه', onPressed: () async { try { await ref.read(apiProvider).send('/notifications/read'); ref.invalidate(remoteProvider('/notifications')); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } }, icon: const Icon(Icons.done_all)), builder: (data) => (data as List).isEmpty ? const Center(child: Text('اعلان تازه‌ای ندارید.')) : ListView(children: data.map((n) => ListTile(leading: Icon(n['readAt'] == null ? Icons.notifications_active_outlined : Icons.notifications_none), title: Text(n['title']), subtitle: Text(n['body']))).toList()));
}
class BookmarksScreen extends ConsumerWidget {
  const BookmarksScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => RemoteScreen(title: 'خبرهای ذخیره‌شده', path: '/bookmarks', builder: (data) => (data as List).isEmpty ? const Center(child: Text('هنوز خبری ذخیره نکرده‌اید.')) : ListView(padding: const EdgeInsets.all(16), children: data.map((j) => Column(children: [NewsCard(article: Article.fromJson(Map<String, dynamic>.from(j))), TextButton(onPressed: () async { try { await ref.read(apiProvider).send('/bookmarks/${j['id']}', method: 'DELETE'); ref.invalidate(remoteProvider('/bookmarks')); } catch (e) { if (context.mounted) notice(context, errorMessage(e)); } }, child: const Text('حذف از ذخیره‌ها'))])).toList()));
}
class OpinionsScreen extends ConsumerWidget {
  const OpinionsScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => RemoteScreen(title: 'دیدگاه‌های ویژه', path: '/news?vip=true', builder: (data) => ListView(padding: const EdgeInsets.all(16), children: (data['items'] as List).map((j) => NewsCard(article: Article.fromJson(Map<String, dynamic>.from(j)))).toList()));
}
class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) => RemoteScreen(title: 'اشتراک و پرداخت‌ها', path: '/subscriptions/payments', builder: (data) => ListView(padding: const EdgeInsets.all(20), children: [ref.watch(remoteProvider('/subscriptions/status')).when(loading: () => const LinearProgressIndicator(), error: (e, _) => Text(errorMessage(e)), data: (s) => Text(s == null ? 'اشتراک فعالی ندارید.' : 'اعتبار اشتراک تا ${s['expiresAt']}', style: const TextStyle(fontSize: 19))), const Divider(height: 30), if ((data as List).isEmpty) const Text('پرداختی ثبت نشده است.'), ...data.map((p) => ListTile(title: Text('${(p['amount'] as num) ~/ 10} تومان'), subtitle: Text('${p['createdAt']}'), trailing: Text({'VERIFIED': 'تایید شده', 'PENDING': 'در انتظار', 'FAILED': 'ناموفق'}[p['status']] ?? p['status'])))]));
}

class OfficialChannelsScreen extends StatefulWidget {
  const OfficialChannelsScreen({super.key});
  @override State<OfficialChannelsScreen> createState()=>_OfficialChannelsState();
}
class _OfficialChannelsState extends State<OfficialChannelsScreen> {
  late final Future<List<Map<String,String>>> channels=loadOfficialChannels();
  Future<void> launch(String url) async {
    try { final ok=await launchUrl(Uri.parse(url),mode:LaunchMode.externalApplication); if(!ok&&mounted) notice(context,'باز کردن پیوند ممکن نشد.'); }
    catch (_) { if(mounted) notice(context,'باز کردن پیوند ممکن نشد.'); }
  }
  @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('کانال‌های خبرفوری')),body:FutureBuilder<List<Map<String,String>>>(future:channels,builder:(context,snapshot){
    if(snapshot.hasError) return const Center(child:Text('بارگذاری نشانی کانال‌ها انجام نشد.'));
    if(!snapshot.hasData) return const Center(child:CircularProgressIndicator());
    return ListView(padding:const EdgeInsets.all(20),children:[Image.asset(brandLogo,height:105),const SizedBox(height:20),const Text('نشانی‌ها از پیوندهای وب‌سایت خبرفوری گرفته شده‌اند.',textAlign:TextAlign.center),ListTile(leading:const Icon(Icons.public),title:const Text('وب‌سایت خبرفوری'),onTap:()=>launch(brandWebsite)),...snapshot.data!.map((channel)=>Card(child:ListTile(leading:const Icon(Icons.send_outlined),title:Text(channel['name']!),subtitle:Text(channel['url']!,textDirection:TextDirection.ltr),trailing:const Icon(Icons.open_in_new),onTap:()=>launch(channel['url']!))))]);
  }));
}
