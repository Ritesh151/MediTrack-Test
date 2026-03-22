import 'package:dio/dio.dart';
import '../core/constants/app_constants.dart';
import '../core/interceptors/dio_interceptor.dart';

class ApiService {
  final Dio dio = Dio();

  ApiService() {
    dio.options.baseUrl = AppConstants.baseUrl;
    dio.options.connectTimeout = const Duration(seconds: 30);
    dio.options.receiveTimeout = const Duration(seconds: 30);
    dio.interceptors.add(DioInterceptor());
  }

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  Future<Response> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await dio.delete(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  String _readableError(DioException e) {
    if (e.response != null) {
      switch (e.response?.statusCode) {
        case 400:
          return 'Bad request: ${e.response?.data['message'] ?? 'Invalid data provided'}';
        case 401:
          return 'Unauthorized: Please login to continue';
        case 403:
          return 'Forbidden: You don\'t have permission to perform this action';
        case 404:
          return 'Not found: The requested resource was not found';
        case 500:
          return 'Server error: Please try again later';
        default:
          return 'Error: ${e.response?.data['message'] ?? 'Something went wrong'}';
      }
    }
    
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout: Please check your internet connection';
      case DioExceptionType.sendTimeout:
        return 'Request timeout: Please try again';
      case DioExceptionType.receiveTimeout:
        return 'Response timeout: Server is taking too long to respond';
      case DioExceptionType.cancel:
        return 'Request was cancelled';
      case DioExceptionType.unknown:
        return 'Network error: Please check your internet connection';
      default:
        return 'An unexpected error occurred: ${e.message}';
    }
  }
}
