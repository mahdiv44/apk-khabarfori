import 'dart:convert';
import 'package:flutter/services.dart';
const brandWebsite='https://www.khabarfoori.com/';
const brandLogo='assets/brand/khabarfoori-logo.png';
const brandIcon='assets/brand/khabarfoori-icon.png';
Future<List<Map<String,String>>> loadOfficialChannels() async {
  final data=jsonDecode(await rootBundle.loadString('assets/brand/official.json')) as Map<String,dynamic>;
  return (data['channels'] as List).map((item)=>{'name':item['name'] as String,'url':item['url'] as String}).toList();
}
