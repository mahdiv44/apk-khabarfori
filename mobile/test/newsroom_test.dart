import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:khabarfori/newsroom.dart';
import 'package:khabarfori/screens.dart';
import 'package:khabarfori/features/news/domain/article.dart';
void main(){
 testWidgets('popular card shows source rank, no category or fabricated views',(tester)async{
  const article=Article(id:'1',title:'خبر تصویری',description:'خلاصه خبر',content:'',category:'اقتصاد',author:'تحریریه',vip:false,locked:false,views:900,sourceRank:2,sourceKind:'website');
  await tester.pumpWidget(MaterialApp(theme:newsroomTheme(Brightness.dark),home:const Scaffold(body:NewsCard(article:article))));
  expect(find.text('سایت خبرفوری'),findsOneWidget);
  expect(find.text('اقتصاد'),findsNothing);
  expect(find.text('900 بازدید'),findsNothing);
  expect(find.byIcon(Icons.newspaper_rounded),findsOneWidget);
  expect(tester.takeException(),isNull);
 });
 test('light and dark themes use separate accessible surfaces',(){
  final light=newsroomTheme(Brightness.light),dark=newsroomTheme(Brightness.dark);
  expect(dark.brightness,Brightness.dark);
  expect(light.scaffoldBackgroundColor.computeLuminance(),greaterThan(.8));
  expect(dark.scaffoldBackgroundColor.computeLuminance(),lessThan(.05));
 });
}
