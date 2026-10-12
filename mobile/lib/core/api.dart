import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiProvider = Provider<Api>((ref) => Api());
class Api {
  static const baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:4000/api/v1');
  final storage = const FlutterSecureStorage();
  late final Dio dio;
  Future<void>? _refreshing;
  final Dio? refreshClient;
  Api({this.refreshClient}) {
    if (kReleaseMode && !baseUrl.startsWith('https://')) {
      throw StateError('Release builds require an HTTPS API_URL');
    }
    dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: const Duration(seconds: 15), receiveTimeout: const Duration(seconds: 20)));
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      const publicAuth = ['/auth/login','/auth/register','/auth/refresh','/auth/forgot-password','/auth/reset-password'];
      final token = await savedToken('accessToken');
      if (token != null && !publicAuth.contains(options.path)) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }, onError: (error, handler) async {
      final request = error.requestOptions;
      if (error.response?.statusCode == 401 && request.extra['retried'] != true && !request.path.startsWith('/auth/')) {
        if (await savedToken('refreshToken') == null) { handler.next(error); return; }
        try {
          final current = await savedToken('accessToken');
          if (request.headers['Authorization'] == 'Bearer $current') {
            _refreshing ??= _refresh().whenComplete(() => _refreshing = null);
            await _refreshing;
          }
        } on DioException catch (refreshError) {
          // Offline, 429 and server errors must not sign the user out.
          if ([401,403].contains(refreshError.response?.statusCode)) await clearSession();
          handler.next(refreshError); return;
        } catch (_) { handler.next(error); return; }
        request.extra['retried'] = true;
        request.headers['Authorization'] = 'Bearer ${await savedToken('accessToken')}';
        try { handler.resolve(await dio.fetch<dynamic>(request)); }
        on DioException catch (retryError) { handler.next(retryError); }
        return;
      }
      handler.next(error);
    }));
  }
  Future<String?> savedToken(String name) async {
    final saved = await storage.read(key:'session');
    if (saved != null) return (jsonDecode(saved) as Map)[name] as String?;
    return storage.read(key:name=='accessToken'?'access_token':'refresh_token');
  }
  Future<void> _refresh() async {
    final token = await savedToken('refreshToken');
    if (token == null) throw StateError('No session');
    final response = await (refreshClient ?? Dio(BaseOptions(baseUrl:baseUrl,connectTimeout:const Duration(seconds:15),receiveTimeout:const Duration(seconds:20)))).post('/auth/refresh',data:{'refreshToken':token});
    await storeTokens(Map<String,dynamic>.from(response.data));
  }
  Future<void> storeTokens(Map<String, dynamic> data) async {
    // Persist the rotated pair together to avoid partially updated sessions.
    await storage.write(key:'session',value:jsonEncode({'accessToken':data['accessToken'] as String,'refreshToken':data['refreshToken'] as String}));
    await storage.delete(key:'access_token'); await storage.delete(key:'refresh_token');
  }
  Future<void> clearSession() async { await storage.delete(key:'session'); await storage.delete(key:'access_token'); await storage.delete(key:'refresh_token'); }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async => (await dio.get(path, queryParameters: query)).data;
  Future<dynamic> send(String path, {String method = 'POST', dynamic data, Map<String, dynamic>? headers}) async => (await dio.request(path, data: data, options: Options(method: method, headers: headers))).data;
}
String errorMessage(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] != null) {
      final message = data['message'];
      return message is List ? message.join('\n') : message.toString();
    }
    if (error.response?.statusCode == 401) return 'برای ادامه وارد حساب شوید.';
    if (error.response?.statusCode == 403) return 'برای این بخش دسترسی کافی ندارید.';
    return 'ارتباط با سرویس برقرار نشد. دوباره تلاش کنید.';
  }
  return 'عملیات انجام نشد. دوباره تلاش کنید.';
}
