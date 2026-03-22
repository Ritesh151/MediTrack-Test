class TicketModel {
  final String id;
  final String caseNumber;
  final String patientId;
  final Map<String, dynamic>? patient; // Populated from backend
  final String? assignedAdminId;
  final Map<String, dynamic>? assignedAdmin; // Populated from backend
  final String issueTitle;
  final String description;
  final String status;
  final String? priority;
  final TicketReply? reply;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Getters for easier access
  String? get patientName => patient?['name'];
  String? get assignedAdminName => assignedAdmin?['name'];

  TicketModel({
    required this.id,
    required this.caseNumber,
    required this.patientId,
    this.patient,
    this.assignedAdminId,
    this.assignedAdmin,
    required this.issueTitle,
    required this.description,
    required this.status,
    this.priority,
    this.reply,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['_id'] ?? json['id'] ?? '', // Handle MongoDB _id
      caseNumber: json['caseNumber'] ?? '',
      patientId: json['patientId'] is Map ? json['patientId']['_id'] : (json['patientId'] ?? ''),
      patient: json['patientId'] is Map ? json['patientId'] : null,
      assignedAdminId: json['assignedAdminId'] is Map ? json['assignedAdminId']['_id'] : json['assignedAdminId'],
      assignedAdmin: json['assignedAdminId'] is Map ? json['assignedAdminId'] : null,
      issueTitle: json['issueTitle'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      reply: json['reply'] != null ? TicketReply.fromJson(json['reply']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'caseNumber': caseNumber,
      'patientId': patientId,
      'assignedAdminId': assignedAdminId,
      'issueTitle': issueTitle,
      'description': description,
      'status': status,
      'reply': reply?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class TicketReply {
  final String doctorName;
  final String doctorPhone;
  final String specialization;
  final String replyMessage;
  final String repliedBy;
  final DateTime repliedAt;

  TicketReply({
    required this.doctorName,
    required this.doctorPhone,
    required this.specialization,
    required this.replyMessage,
    required this.repliedBy,
    required this.repliedAt,
  });

  factory TicketReply.fromJson(Map<String, dynamic> json) {
    return TicketReply(
      doctorName: json['doctorName'] ?? '',
      doctorPhone: json['doctorPhone'] ?? '',
      specialization: json['specialization'] ?? '',
      replyMessage: json['replyMessage'] ?? '',
      repliedBy: json['repliedBy'] is Map ? json['repliedBy']['_id'] : (json['repliedBy'] ?? ''),
      repliedAt: DateTime.parse(json['repliedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'doctorName': doctorName,
      'doctorPhone': doctorPhone,
      'specialization': specialization,
      'replyMessage': replyMessage,
      'repliedBy': repliedBy,
      'repliedAt': repliedAt.toIso8601String(),
    };
  }
}
