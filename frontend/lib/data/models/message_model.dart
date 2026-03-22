class MessageModel {
  final String id;
  final String ticketId;
  final String senderId;
  final String senderRole;
  final String senderName;
  final String content;
  final DateTime createdAt;

  MessageModel({
    required this.id,
    required this.ticketId,
    required this.senderId,
    required this.senderRole,
    required this.senderName,
    required this.content,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    // Handle populated senderId from backend
    // Backend returns: { _id, name, email, role }
    String senderId = '';
    String senderRole = '';
    String senderName = '';
    
    if (json['senderId'] is Map) {
      // Populated sender object
      final senderData = json['senderId'] as Map<String, dynamic>;
      senderId = (senderData['_id'] ?? senderData['id'] ?? '').toString();
      senderRole = (senderData['role'] ?? '').toString();
      senderName = (senderData['name'] ?? 'Unknown').toString();
    } else if (json['senderId'] != null) {
      // Unpopulated - just ObjectId string
      senderId = json['senderId'].toString();
      senderRole = (json['senderRole'] ?? '').toString();
      senderName = (json['senderName'] ?? 'Unknown').toString();
    }

    // Handle ticketId (could be populated or just ObjectId)
    String ticketId = '';
    if (json['ticketId'] is Map) {
      final ticketData = json['ticketId'] as Map<String, dynamic>;
      ticketId = (ticketData['_id'] ?? ticketData['id'] ?? '').toString();
    } else if (json['ticketId'] != null) {
      ticketId = json['ticketId'].toString();
    }

    // Parse createdAt safely
    DateTime createdAt;
    try {
      if (json['createdAt'] != null) {
        createdAt = DateTime.parse(json['createdAt'].toString());
      } else {
        createdAt = DateTime.now();
      }
    } catch (e) {
      createdAt = DateTime.now();
    }

    return MessageModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      ticketId: ticketId,
      senderId: senderId,
      senderRole: senderRole,
      senderName: senderName,
      content: (json['content'] ?? '').toString(),
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticketId': ticketId,
      'senderId': senderId,
      'senderRole': senderRole,
      'senderName': senderName,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'MessageModel(id: $id, senderId: $senderId, senderName: $senderName, content: ${content.length > 30 ? '${content.substring(0, 30)}...' : content})';
  }
}
