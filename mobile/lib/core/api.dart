import 'dart:async';
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
  Api() {
    if (kReleaseMode && !baseUrl.startsWith('https://')) {
      throw StateError('Release builds require an HTTPS API_URL');
    }
    dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: const Duration(seconds: 15), receiveTimeout: const Duration(seconds: 20)));
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final token = await storage.read(key: 'access_token');
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }, onError: (error, handler) async {
      final request = error.requestOptions;
      if (error.response?.statusCode == 401 && request.extra['retried'] != true && !request.path.startsWith('/auth/')) {
        try {
          _refreshing ??= _refresh();
          await _refreshing;
          request.extra['retried'] = true;
          request.headers['Authorization'] = 'Bearer ${await storage.read(key: 'access_token')}';
          return handler.resolve(await dio.fetch<dynamic>(request));
        } catch (_) {
          await clearSession();
        } finally { _refreshing = null; }
      }
      handler.next(error);
    }));
  }
  Future<void> _refresh() async {
    final token = await storage.read(key: 'refresh_token');
    if (token == null) throw StateError('No session');
    final response = await Dio(BaseOptions(baseUrl: baseUrl)).post('/auth/refresh', data: {'refreshToken': token});
    await storeTokens(Map<String, dynamic>.from(response.data));
  }
  Future<void> storeTokens(Map<String, dynamic> data) async {
    await storage.write(key: 'access_token', value: data['accessToken'] as String);
    await storage.write(key: 'refresh_token', value: data['refreshToken'] as String);
  }
  Future<void> clearSession() async { await storage.delete(key: 'access_token'); await storage.delete(key: 'refresh_token'); }
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
