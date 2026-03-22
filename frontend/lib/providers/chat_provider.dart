import 'package:flutter/material.dart';
import '../data/models/message_model.dart';
import '../data/repositories/chat_repository.dart';
import 'dart:async';
import 'dart:developer' as developer;

class ChatProvider extends ChangeNotifier {
  final ChatRepository _repository = ChatRepository();
  List<MessageModel> _messages = [];
  bool _isLoading = false;
  String? _errorMessage;
  Timer? _refreshTimer;

  List<MessageModel> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Start auto-refresh for messages (every 3 seconds)
  void startAutoRefresh(String ticketId) {
    developer.log('🔄 Starting auto-refresh for ticket: $ticketId', name: 'ChatProvider');
    stopAutoRefresh(); // Stop any existing timer
    _refreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      developer.log('⏰ Auto-refresh triggered', name: 'ChatProvider');
      loadMessages(ticketId);
    });
  }

  // Stop auto-refresh
  void stopAutoRefresh() {
    developer.log('⏹️ Stopping auto-refresh', name: 'ChatProvider');
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }

  Future<void> loadMessages(String ticketId) async {
    developer.log('📥 Loading messages for ticket: $ticketId', name: 'ChatProvider');
    _setLoading(true);
    _clearError();
    try {
      _messages = await _repository.getMessages(ticketId);
      developer.log('✅ Loaded ${_messages.length} messages', name: 'ChatProvider');
      notifyListeners();
    } catch (e) {
      developer.log('💥 Failed to load messages: $e', name: 'ChatProvider', error: e);
      _setError('Failed to load messages: ${_extractErrorMessage(e)}');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> sendMessage(String ticketId, String content) async {
    developer.log('📤 Sending message to ticket: $ticketId', name: 'ChatProvider');
    developer.log('📝 Content: "${content.substring(0, content.length > 50 ? 50 : content.length)}..."', name: 'ChatProvider');
    
    if (content.trim().isEmpty) {
      developer.log('❌ Empty message rejected', name: 'ChatProvider');
      _setError('Message cannot be empty');
      return;
    }

    _clearError();
    try {
      // Create optimistic message locally for instant UI update
      final optimisticMessage = MessageModel(
        id: 'temp-${DateTime.now().millisecondsSinceEpoch}',
        ticketId: ticketId,
        senderId: 'current-user', // Will be updated with actual ID from response
        senderRole: 'user', // Will be updated from response
        senderName: 'You', // Will be updated from response
        content: content.trim(),
        createdAt: DateTime.now(),
      );
      
      // Add optimistic message immediately
      _messages.add(optimisticMessage);
      notifyListeners();
      developer.log('✅ Added optimistic message to UI', name: 'ChatProvider');
      
      // Send to server
      final serverMessage = await _repository.sendMessage(ticketId, content.trim());
      
      // Replace optimistic message with server response
      final index = _messages.indexWhere((m) => m.id == optimisticMessage.id);
      if (index != -1) {
        _messages[index] = serverMessage;
        notifyListeners();
        developer.log('✅ Replaced optimistic message with server response', name: 'ChatProvider');
      } else {
        // Fallback: just add the server message
        _messages.add(serverMessage);
        notifyListeners();
        developer.log('✅ Added server message (fallback)', name: 'ChatProvider');
      }
      
      // Optionally refresh to get the complete message list
      // await loadMessages(ticketId);
    } catch (e) {
      developer.log('💥 Failed to send message: $e', name: 'ChatProvider', error: e);
      
      // Remove optimistic message on error
      _messages.removeWhere((m) => m.id.startsWith('temp-'));
      notifyListeners();
      
      _setError('Failed to send message: ${_extractErrorMessage(e)}');
      rethrow;
    }
  }

  void clearMessages() {
    developer.log('🗑️ Clearing all messages', name: 'ChatProvider');
    _messages = [];
    stopAutoRefresh();
    notifyListeners();
  }

  void _setLoading(bool value) {
    if (_isLoading != value) {
      _isLoading = value;
      developer.log('🔄 Loading state: $_isLoading', name: 'ChatProvider');
      notifyListeners();
    }
  }

  void _setError(String error) {
    _errorMessage = error;
    developer.log('❌ Error set: $error', name: 'ChatProvider');
    notifyListeners();
  }

  void _clearError() {
    if (_errorMessage != null) {
      _errorMessage = null;
      developer.log('✅ Error cleared', name: 'ChatProvider');
      notifyListeners();
    }
  }

  // Extract user-friendly error message from exception
  String _extractErrorMessage(dynamic error) {
    if (error is Exception) {
      final errorString = error.toString();
      
      // Handle common error patterns
      if (errorString.contains('501')) {
        return 'Chat service not available (501)';
      } else if (errorString.contains('401')) {
        return 'Authentication required';
      } else if (errorString.contains('403')) {
        return 'Access denied';
      } else if (errorString.contains('404')) {
        return 'Ticket not found';
      } else if (errorString.contains('500')) {
        return 'Server error';
      } else if (errorString.contains('network')) {
        return 'Network connection error';
      } else if (errorString.contains('timeout')) {
        return 'Request timeout';
      } else if (errorString.contains('message:')) {
        // Extract message from API response
        final match = RegExp(r'message:\s*([^}]+)').firstMatch(errorString);
        if (match != null) {
          return match.group(1)?.trim() ?? 'Unknown error';
        }
      }
    }
    
    return 'Unknown error occurred';
  }

  @override
  void dispose() {
    developer.log('🗑️ Disposing ChatProvider', name: 'ChatProvider');
    stopAutoRefresh();
    super.dispose();
  }
}
