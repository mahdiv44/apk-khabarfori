import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'core/api.dart';
import 'screens.dart';
import 'staff_screens.dart';
import 'features/news/domain/article.dart';
import 'features/news/presentation/providers.dart';

final appearanceProvider = StateNotifierProvider<Appearance, ThemeMode>((ref)=>Appearance(ref.read(apiProvider)));
class Appearance extends StateNotifier<ThemeMode> {
 final Api api;
 bool changed=false;
 Appearance(this.api):super(ThemeMode.system){_load();}
 Future<void> _load() async {final v=await api.storage.read(key:'appearance');if(mounted&&!changed)state=v=='dark'?ThemeMode.dark:v=='light'?ThemeMode.light:ThemeMode.system;}
 Future<void> toggle(bool dark) async {changed=true;state=dark?ThemeMode.dark:ThemeMode.light;await api.storage.write(key:'appearance',value:dark?'dark':'light');}
}
ThemeData newsroomTheme(Brightness brightness){
 final dark=brightness==Brightness.dark;
 final colors=ColorScheme.fromSeed(seedColor:const Color(0xff147447),brightness:brightness);
 return ThemeData(useMaterial3:true,colorScheme:colors,scaffoldBackgroundColor:dark?const Color(0xff0c1914):const Color(0xfff3f7f3),
 appBarTheme:AppBarTheme(backgroundColor:dark?const Color(0xff0c1914):const Color(0xfff3f7f3),centerTitle:false,elevation:0),
 cardTheme:CardThemeData(elevation:0,color:dark?const Color(0xff16281f):Colors.white,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(24))),
 inputDecorationTheme:InputDecorationTheme(filled:true,fillColor:colors.surfaceContainerHighest.withValues(alpha:.5),contentPadding:const EdgeInsets.all(18),border:OutlineInputBorder(borderRadius:BorderRadius.circular(18),borderSide:BorderSide.none)),
 filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(padding:const EdgeInsets.symmetric(horizontal:24,vertical:16),shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(16)))),
 textTheme:const TextTheme(bodyMedium:TextStyle(height:1.7),titleLarge:TextStyle(fontWeight:FontWeight.w800)));
}
class NewsroomShell extends ConsumerStatefulWidget {
 const NewsroomShell({super.key});
 @override ConsumerState<NewsroomShell> createState()=>_ShellState();
}
class _ShellState extends ConsumerState<NewsroomShell>{
 int tab=0;
 @override Widget build(BuildContext context)=>Scaffold(
 appBar:AppBar(title:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Text('خبرفوری',style:TextStyle(fontSize:25,fontWeight:FontWeight.w900)),Text(['نبض خبر، هر لحظه همراه شما','خبرهایی برای بعد','میز کار من','حساب و تنظیمات'][tab],style:Theme.of(context).textTheme.labelMedium)]),actions:[IconButton(tooltip:'تغییر حالت روشن و تاریک',onPressed:()=>ref.read(appearanceProvider.notifier).toggle(Theme.of(context).brightness!=Brightness.dark),icon:Icon(Theme.of(context).brightness==Brightness.dark?Icons.light_mode_outlined:Icons.dark_mode_outlined)),IconButton(tooltip:'اعلان‌ها',onPressed:()=>open(context,const NotificationsScreen()),icon:const Icon(Icons.notifications_none_rounded))]),
 body:SafeArea(child:[const PopularFeed(),const BookmarksScreen(),const EditorialDesk(),const ProfileScreen()][tab]),
 bottomNavigationBar:NavigationBar(selectedIndex:tab,onDestinationSelected:(v)=>setState(()=>tab=v),destinations:const [NavigationDestination(icon:Icon(Icons.public),label:'خبرها'),NavigationDestination(icon:Icon(Icons.bookmark_outline),label:'ذخیره‌ها'),NavigationDestination(icon:Icon(Icons.space_dashboard_outlined),label:'میز کار'),NavigationDestination(icon:Icon(Icons.person_outline),label:'حساب من')]));
}
class NewsPhoto extends StatelessWidget {
 final String? url;final double height;
 const NewsPhoto({super.key,this.url,this.height=200});
 @override Widget build(BuildContext context){final fallback=Container(height:height,width:double.infinity,decoration:const BoxDecoration(gradient:LinearGradient(colors:[Color(0xff164a32),Color(0xff389666)])),child:const Center(child:Icon(Icons.newspaper_rounded,color:Colors.white70,size:54)));return ClipRRect(borderRadius:BorderRadius.circular(18),child:url==null||url!.isEmpty?fallback:Image.network(url!,height:height,width:double.infinity,fit:BoxFit.cover,errorBuilder:(_,__,___)=>fallback,loadingBuilder:(c,child,p)=>p==null?child:SizedBox(height:height,child:const Center(child:CircularProgressIndicator(strokeWidth:2)))));}
}
class PopularFeed extends ConsumerStatefulWidget {
 const PopularFeed({super.key});
 @override ConsumerState<PopularFeed> createState()=>_FeedState();
}
class _FeedState extends ConsumerState<PopularFeed>{
 bool busy=false;String search='';Timer? timer;final extra=<Article>[];String? cursor;int generation=0;
 @override void dispose(){timer?.cancel();super.dispose();}
 void reset(){extra.clear();cursor=null;generation++;busy=false;}
 @override Widget build(BuildContext context)=>Column(children:[Padding(padding:const EdgeInsets.fromLTRB(18,12,18,8),child:Row(children:[Expanded(child:TextField(decoration:const InputDecoration(hintText:'جست‌وجوی خبر',prefixIcon:Icon(Icons.search_rounded)),onChanged:(v){timer?.cancel();timer=Timer(const Duration(milliseconds:350),(){setState((){search=v;reset();});ref.read(searchProvider.notifier).state=v;});})),PopupMenuButton<String>(tooltip:'مرتب‌سازی خبرها',icon:const Icon(Icons.tune_rounded),initialValue:ref.watch(newsSortProvider),onSelected:(v){setState(reset);ref.read(newsSortProvider.notifier).state=v;},itemBuilder:(_)=>const [PopupMenuItem(value:'latest',child:Text('جدیدترین')),PopupMenuItem(value:'trending',child:Text('پربازدیدترین'))])])),Expanded(child:_feed())]);
 Widget _feed()=>ref.watch(newsProvider).when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>ErrorView(error:e,retry:()=>ref.invalidate(newsProvider)),data:(page){final items=[...page.items,...extra];final next=extra.isEmpty?page.nextCursor:cursor;return RefreshIndicator(onRefresh:()async{setState(reset);ref.invalidate(newsProvider);await ref.read(newsProvider.future);},child:ListView(padding:const EdgeInsets.all(18),physics:const AlwaysScrollableScrollPhysics(),children:[if(items.isEmpty)const Padding(padding:EdgeInsets.all(32),child:Text('هنوز خبری در این فهرست نیست. برای تازه‌سازی صفحه را پایین بکشید.')),...items.asMap().entries.map((e)=>NewsCard(article:e.value,featured:e.key==0)),if(next!=null)OutlinedButton(onPressed:busy?null:()async{final version=generation;setState(()=>busy=true);try{final p=await ref.read(newsRepositoryProvider).list(query:search,cursor:next,sort:ref.read(newsSortProvider));if(mounted&&version==generation)setState((){extra.addAll(p.items);cursor=p.nextCursor;});}catch(e){if(mounted&&version==generation)notice(context,errorMessage(e));}finally{if(mounted&&version==generation)setState(()=>busy=false);}},child:Text(busy?'در حال دریافت…':'خبرهای بیشتر'))]));});
}
class EditorialDesk extends ConsumerWidget {
 const EditorialDesk({super.key});
 @override Widget build(BuildContext context,WidgetRef ref)=>ref.watch(remoteProvider('/dashboard')).when(loading:()=>const Center(child:CircularProgressIndicator()),error:(e,_)=>ErrorView(error:e,retry:()=>ref.invalidate(remoteProvider('/dashboard'))),data:(d){
 final kind=d['kind'];final titles={'admin':'اتاق مدیریت','manager':'داشبورد مدیران','chief':'میز سردبیر','editor':'میز دبیر','reporter':'میز تحریریه','reader':'فضای شخصی شما'};final permissions=List<String>.from(d['permissions']);bool can(String p)=>permissions.contains('*')||permissions.contains(p);final counts=d['counts'] as Map;final queue=d['queue'] as List;
 Widget action(String title,IconData icon,Widget screen)=>Card(child:ListTile(leading:Icon(icon,color:Theme.of(context).colorScheme.primary),title:Text(title),trailing:const Icon(Icons.chevron_left),onTap:()=>open(context,screen)));
 return RefreshIndicator(onRefresh:()async{ref.invalidate(remoteProvider('/dashboard'));await ref.read(remoteProvider('/dashboard').future);},child:ListView(padding:const EdgeInsets.all(18),children:[Container(padding:const EdgeInsets.all(24),decoration:BoxDecoration(borderRadius:BorderRadius.circular(26),gradient:LinearGradient(colors:kind=='manager'||kind=='admin'?[const Color(0xff145c70),const Color(0xff269c96)]:[const Color(0xff14663d),const Color(0xff4ba777)])),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('سلام، ${d['profile']['name']}',style:const TextStyle(color:Colors.white70)),const SizedBox(height:12),Text(titles[kind]??'میز کار',style:const TextStyle(color:Colors.white,fontSize:28,fontWeight:FontWeight.w900)),const SizedBox(height:8),Text(kind=='chief'?'مرور، تصمیم‌گیری و انتشار خبر':kind=='editor'?'پیگیری خبرها و آماده‌سازی برای انتشار':kind=='manager'||kind=='admin'?'نمای کلی عملکرد و دسترسی‌های سازمان':'خبرهای ذخیره‌شده، جلسات و خدمات شما',style:const TextStyle(color:Colors.white,height:1.8))])),const SizedBox(height:18),Wrap(spacing:12,runSpacing:12,children:[if(can('news:read-internal')||can('news:write'))...[_Metric('در انتظار بررسی',counts['REVIEW']??0,Colors.orange),_Metric('منتشرشده',counts['PUBLISHED']??0,Colors.teal)],_Metric('اعلان خوانده‌نشده',d['unread'],Colors.purple),if(d['team']!=null)_Metric('اعضای فعال',d['team'],Colors.blue),if(d['views']!=null)_Metric('بازدید داخل برنامه',d['views'],Colors.pink)]),const SizedBox(height:18),
 if(can('news:write'))action('ثبت خبر برای بررسی',Icons.edit_note,const ComposeStory()),
 if(d['salaryAvailable']==true)action('فیش حقوقی • با رمز حساب',Icons.account_balance_wallet_outlined,const SalaryScreen()),action('جلسات و یادآوری‌ها',Icons.event_note,const StaffListScreen(path:'/meetings',title:'جلسات من')),action('اعلان‌ها',Icons.notifications_outlined,const NotificationsScreen()),if(can('employees:read'))action('همکاران سازمان',Icons.groups_outlined,const EmployeesScreen()),if(can('messages:write'))action('گفت‌وگو با تحریریه',Icons.forum_outlined,const MessagesScreen()),
 if(can('users:read'))Card(child:ListTile(leading:const Icon(Icons.admin_panel_settings_outlined),title:const Text('مدیریت کاربران و دسترسی‌ها'),subtitle:const Text('باز کردن پنل مدیریت'),onTap:()=>launchUrl(Uri.parse(const String.fromEnvironment('PUBLIC_WEB_URL')),mode:LaunchMode.externalApplication))),
 if((d['meetings'] as List).isNotEmpty)...[const Padding(padding:EdgeInsets.symmetric(vertical:16),child:Text('جلسات پیش رو',style:TextStyle(fontSize:22,fontWeight:FontWeight.bold))),...(d['meetings'] as List).map((m)=>Card(child:ListTile(leading:const CircleAvatar(child:Icon(Icons.event_available)),title:Text(m['title']),subtitle:Text(DateTime.parse(m['date']).toLocal().toString().substring(0,16)),onTap:()=>open(context,const StaffListScreen(path:'/meetings',title:'جلسات من')))))],if(queue.isNotEmpty)...[const Padding(padding:EdgeInsets.symmetric(vertical:20),child:Text('صف تحریریه',style:TextStyle(fontSize:22,fontWeight:FontWeight.bold))),...queue.map((x)=>Card(child:Padding(padding:const EdgeInsets.all(18),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(x['status']=='REVIEW'?'آمادهٔ بررسی':'پیش‌نویس',style:TextStyle(color:Theme.of(context).colorScheme.primary)),Text(x['title'],style:const TextStyle(fontSize:18,fontWeight:FontWeight.bold)),TextButton(onPressed:()=>open(context,ArticleScreen(id:x['id'])),child:const Text('خواندن خبر')),if(can('news:publish'))FilledButton(onPressed:()async{final approved=await showDialog<bool>(context:context,builder:(c)=>AlertDialog(title:const Text('انتشار عمومی خبر؟'),content:Text(x['title']),actions:[TextButton(onPressed:()=>Navigator.pop(c,false),child:const Text('بازگشت')),FilledButton(onPressed:()=>Navigator.pop(c,true),child:const Text('انتشار'))]));if(approved!=true)return;try{await ref.read(apiProvider).send('/news/${x['id']}/status',method:'PATCH',data:{'status':'PUBLISHED'});ref.invalidate(remoteProvider('/dashboard'));}catch(e){if(context.mounted)notice(context,errorMessage(e));}},child:const Text('تأیید و انتشار'))]))))],const SizedBox(height:24)]));
 });
}
class _Metric extends StatelessWidget {
 final String title;final dynamic value;final MaterialColor color;
 const _Metric(this.title,this.value,this.color);
 @override Widget build(BuildContext context)=>Container(width:(MediaQuery.sizeOf(context).width-48)/2,padding:const EdgeInsets.all(18),decoration:BoxDecoration(color:color.withValues(alpha:(Theme.of(context).brightness==Brightness.dark) ? 0.18 : 0.09),borderRadius:BorderRadius.circular(20)),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('$value',style:TextStyle(fontSize:28,fontWeight:FontWeight.w900,color:Theme.of(context).brightness==Brightness.dark?color.shade200:color.shade800)),Text(title)]));
}
class ComposeStory extends ConsumerStatefulWidget {
 const ComposeStory({super.key});
 @override ConsumerState<ComposeStory> createState()=>_ComposeState();
}
class _ComposeState extends ConsumerState<ComposeStory>{
 final title=TextEditingController(),summary=TextEditingController(),body=TextEditingController();bool busy=false;
 @override void dispose(){title.dispose();summary.dispose();body.dispose();super.dispose();}
 @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('خبر تازه')),body:ListView(padding:const EdgeInsets.all(20),children:[TextField(controller:title,maxLength:200,decoration:const InputDecoration(labelText:'تیتر خبر')),const SizedBox(height:16),TextField(controller:summary,maxLength:500,maxLines:3,decoration:const InputDecoration(labelText:'خلاصه')),const SizedBox(height:16),TextField(controller:body,maxLines:10,decoration:const InputDecoration(labelText:'متن خبر')),const SizedBox(height:20),FilledButton(onPressed:busy?null:()async{if(title.text.trim().isEmpty||summary.text.trim().isEmpty||body.text.trim().isEmpty){notice(context,'تیتر، خلاصه و متن را تکمیل کنید.');return;}setState(()=>busy=true);try{await ref.read(apiProvider).send('/news',data:{'title':title.text.trim(),'description':summary.text.trim(),'content':body.text.trim(),'category':'جامعه','status':'REVIEW','kind':'NEWS','vip':false,'tags':[]});ref.invalidate(remoteProvider('/dashboard'));if(context.mounted){notice(context,'خبر برای بررسی ثبت شد.');Navigator.pop(context);}}catch(e){if(context.mounted)notice(context,errorMessage(e));}finally{if(mounted)setState(()=>busy=false);}},child:Text(busy?'در حال ثبت…':'ارسال به صف بررسی'))]));
}
