import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'core/api.dart';

Options salaryOptions(String token)=>Options(headers:{'X-Salary-Token':token});

class SalaryScreen extends ConsumerStatefulWidget {
 const SalaryScreen({super.key});
 @override ConsumerState<SalaryScreen> createState()=>_SalaryState();
}
class _SalaryState extends ConsumerState<SalaryScreen> with WidgetsBindingObserver {
 final password=TextEditingController();
 List<dynamic>? records;
 bool busy=false,foreground=true;
 String? error;
 Timer? expiry;
 @override void initState(){super.initState();WidgetsBinding.instance.addObserver(this);}
 @override void dispose(){expiry?.cancel();password.dispose();WidgetsBinding.instance.removeObserver(this);super.dispose();}
 @override void didChangeAppLifecycleState(AppLifecycleState state){foreground=state==AppLifecycleState.resumed;if(!foreground&&mounted)setState(()=>records=null);}
 Future<void> unlock() async {
  setState((){busy=true;error=null;});
  try{final api=ref.read(apiProvider);final proof=await api.send('/salary/unlock',data:{'password':password.text});password.clear();final result=await api.dio.get<dynamic>('/salary/records',options:salaryOptions(proof['salaryToken'] as String));if(!mounted||!foreground)return;setState(()=>records=result.data as List<dynamic>);expiry?.cancel();expiry=Timer(const Duration(minutes:4),(){if(mounted)setState(()=>records=null);});}
  catch(e){if(mounted)setState(()=>error=errorMessage(e));}
  finally{if(mounted)setState(()=>busy=false);}
 }
 @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('فیش حقوق')),body:ListView(padding:const EdgeInsets.all(24),children:[Container(padding:const EdgeInsets.all(24),margin:const EdgeInsets.only(bottom:24),decoration:BoxDecoration(borderRadius:BorderRadius.circular(24),gradient:const LinearGradient(colors:[Color(0xff146878),Color(0xff31988c)])),child:const Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Icon(Icons.account_balance_wallet_outlined,color:Colors.white,size:36),SizedBox(height:16),Text('حقوق و مزایای من',style:TextStyle(color:Colors.white,fontSize:26,fontWeight:FontWeight.bold)),Text('اطلاعات شخصی، در دسترس خود شما',style:TextStyle(color:Colors.white70))])),const Text('برای مشاهده فیش، همان رمز ورود حساب خود را وارد کنید. مبالغ به ریال است.'),if(error!=null)Padding(padding:const EdgeInsets.all(12),child:Text(error!)),if(records==null)...[const SizedBox(height:20),TextField(controller:password,obscureText:true,enableSuggestions:false,autocorrect:false,decoration:const InputDecoration(labelText:'رمز حساب کاربری')),const SizedBox(height:12),FilledButton(onPressed:busy?null:unlock,child:Text(busy?'در حال بررسی…':'مشاهده فیش')),TextButton(onPressed:()async{const base=String.fromEnvironment('PUBLIC_WEB_URL');final uri=Uri.tryParse('$base/mobile?view=staff');if(uri!=null&&uri.scheme=='https'){await launchUrl(uri,mode:LaunchMode.externalApplication);}else if(context.mounted){ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('نشانی امن وب‌اپ هنوز پیکربندی نشده است.')));}},child:const Text('ورود با اثرانگشت در وب‌اپ امن'))]else...[OutlinedButton(onPressed:()=>setState(()=>records=null),child:const Text('پنهان کردن فیش‌ها')),if(records!.isEmpty)const Text('فیشی ثبت نشده است.'),...records!.map((r)=>Card(child:Padding(padding:const EdgeInsets.all(18),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('دوره ${r['period']}',style:Theme.of(context).textTheme.titleLarge),Text('ناخالص: ${r['grossAmount']} ریال'),Text('خالص پرداختی: ${r['netAmount']} ریال'),if(r['notes']!=null)Text(r['notes'] as String)]))))]]));
}
class StaffListScreen extends ConsumerStatefulWidget {
 final String path,title;
 const StaffListScreen({super.key,required this.path,required this.title});
 @override ConsumerState<StaffListScreen> createState()=>_StaffListState();
}
class _StaffListState extends ConsumerState<StaffListScreen>{
 List<dynamic>? items;
 String? error;
 @override void initState(){super.initState();load();}
 Future<void> load()async{try{final data=await ref.read(apiProvider).get(widget.path);if(mounted)setState((){items=(data is Map?data['items']:data) as List<dynamic>;error=null;});}catch(e){if(mounted)setState(()=>error=errorMessage(e));}}
 @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:Text(widget.title),actions:[IconButton(onPressed:load,icon:const Icon(Icons.refresh))]),body:error!=null?Center(child:Text(error!)):items==null?const Center(child:CircularProgressIndicator()):RefreshIndicator(onRefresh:load,child:ListView(padding:const EdgeInsets.all(20),children:[if(items!.isEmpty)const Text('موردی ثبت نشده است.'),...items!.map((m)=>Card(child:ListTile(title:Text(m['title'] as String),subtitle:Text(widget.path=='/meetings'?'${DateTime.parse(m['date'] as String).toLocal()}\n${m['manager']['name']} · ${m['employee']['name']}\n${{'APPROVED':'برنامه‌ریزی شده','CANCELLED':'لغو شده','COMPLETED':'تکمیل شده'}[m['status']]??m['status']}':'${m['description']}\nبازدید منبع: ${m['sourceViews']??'نامشخص'}'),onTap:m['sourceUrl']==null?null:()async{final uri=Uri.tryParse(m['sourceUrl'] as String);if(uri!=null&&uri.scheme=='https')await launchUrl(uri,mode:LaunchMode.externalApplication);}))) ])));
}
