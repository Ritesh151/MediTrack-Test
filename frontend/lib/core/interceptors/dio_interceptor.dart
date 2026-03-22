import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class DioInterceptor extends Interceptor {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Add auth token to all requests
    final token = await _storage.read(key: 'token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    // Add common headers
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 Unauthorized errors
    if (err.response?.statusCode == 401) {
      try {
        // Clear stored token
        await _storage.delete(key: 'token');
        
        // Create a new DioException with a custom message
        handler.next(DioException(
          requestOptions: err.requestOptions,
          error: 'Session expired. Please login again.',
          type: DioExceptionType.badResponse,
        ));
        return;
      } catch (e) {
        handler.next(err);
        return;
      }
    }

    // Handle network errors
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout) {
      handler.next(DioException(
        requestOptions: err.requestOptions,
        error: 'Connection timeout. Please check your internet connection.',
        type: err.type,
      ));
      return;
    }

    // Handle no internet connection
    if (err.type == DioExceptionType.unknown && 
        err.error?.toString().contains('SocketException') == true) {
      handler.next(DioException(
        requestOptions: err.requestOptions,
        error: 'No internet connection. Please check your network.',
        type: DioExceptionType.unknown,
      ));
      return;
    }

    handler.next(err);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    // Log successful responses for debugging
    if (AppConstants.isDebugMode) {
      // Use debugPrint instead of print for production code
      debugPrint('API Response: ${response.requestOptions.path} - Status: ${response.statusCode}');
    }
    
    handler.next(response);
  }
}
