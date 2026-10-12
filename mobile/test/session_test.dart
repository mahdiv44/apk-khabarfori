import 'dart:async';
import 'dart:typed_data';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:khabarfori/core/api.dart';
class Adapter implements HttpClientAdapter {
 final ResponseBody Function(RequestOptions) respond;
 Adapter(this.respond);
 @override Future<ResponseBody> fetch(RequestOptions options, Stream<Uint8List>? requestStream, Future<void>? cancelFuture) async=>respond(options);
 @override void close({bool force=false}){}
}
ResponseBody response(int status,Map<String,dynamic> data)=>ResponseBody.fromString(jsonEncode(data),status,headers:{Headers.contentTypeHeader:['application/json']});
void main(){
 TestWidgetsFlutterBinding.ensureInitialized();
 setUp(()=>FlutterSecureStorage.setMockInitialValues({'access_token':'old-access','refresh_token':'old-refresh'}));
 test('temporary refresh failure keeps the saved session',()async{
  final refresh=Dio()..httpClientAdapter=Adapter((_)=>response(500,{'message':'Temporary failure'}));
  final api=Api(refreshClient:refresh);api.dio.httpClientAdapter=Adapter((_)=>response(401,{}));
  await expectLater(api.get('/profile'),throwsA(isA<DioException>()));
  expect(await api.savedToken('refreshToken'),'old-refresh');
 });
 test('invalid refresh session is cleared',()async{
  final refresh=Dio()..httpClientAdapter=Adapter((_)=>response(401,{}));
  final api=Api(refreshClient:refresh);api.dio.httpClientAdapter=Adapter((_)=>response(401,{}));
  await expectLater(api.get('/profile'),throwsA(isA<DioException>()));
  expect(await api.savedToken('refreshToken'),isNull);
 });
 test('wrong salary password does not delete a valid refreshed session',()async{
  final refresh=Dio()..httpClientAdapter=Adapter((_)=>response(200,{'accessToken':'new-access','refreshToken':'new-refresh'}));
  final api=Api(refreshClient:refresh);api.dio.httpClientAdapter=Adapter((_)=>response(401,{'message':'Wrong salary password'}));
  await expectLater(api.send('/salary/unlock',data:{'password':'incorrect'}),throwsA(isA<DioException>()));
  expect(await api.savedToken('refreshToken'),'new-refresh');
 });
 test('login never sends an expired bearer token',()async{
  final api=Api();api.dio.httpClientAdapter=Adapter((o){expect(o.headers['Authorization'],isNull);return response(200,{});});
  await api.send('/auth/login',data:{'identifier':'test@example.com','password':'password'});
 });
}
