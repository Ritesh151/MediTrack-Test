import '../../services/api_service.dart';
import '../models/message_model.dart';
import '../../core/constants/app_constants.dart';

class ChatRepository {
  final ApiService _apiService = ApiService();

  Future<List<MessageModel>> getMessages(String ticketId) async {
    final res = await _apiService.dio.get('/api/chat/$ticketId');
    return (res.data as List)
        .map((e) => MessageModel.fromJson(e))
        .toList();
  }

  Future<MessageModel> sendMessage(String ticketId, String message) async {
    final res = await _apiService.dio.post(
      '/api/chat/$ticketId',
      data: {"content": message},
    );
    return MessageModel.fromJson(res.data);
  }
}
