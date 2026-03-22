import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ticket_provider.dart';
import '../../data/models/ticket_model.dart';
import 'ticket_chat_screen.dart';

class TicketReplyScreen extends StatefulWidget {
  final TicketModel ticket;
  const TicketReplyScreen({super.key, required this.ticket});

  @override
  State<TicketReplyScreen> createState() => _TicketReplyScreenState();
}

class _TicketReplyScreenState extends State<TicketReplyScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _formKey = GlobalKey<FormState>();
  final _doctorNameController = TextEditingController();
  final _doctorPhoneController = TextEditingController();
  final _replyMessageController = TextEditingController();
  String? _selectedSpecialization;

  final List<String> _specializations = [
    'Dentist',
    'Bone Specialist',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Orthopedic',
    'Pediatrician',
    'Gynecologist',
    'Psychiatrist',
    'General Physician',
    'Oncologist',
    'Radiologist'
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _doctorNameController.dispose();
    _doctorPhoneController.dispose();
    _replyMessageController.dispose();
    super.dispose();
  }

  Future<void> _submitReply() async {
    if (_formKey.currentState!.validate()) {
      try {
        await context.read<TicketProvider>().replyToTicket(widget.ticket.id, {
          'doctorName': _doctorNameController.text,
          'doctorPhone': _doctorPhoneController.text,
          'specialization': _selectedSpecialization,
          'replyMessage': _replyMessageController.text,
        });
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Reply sent successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isAdmin = user?.role == 'admin';
    final isResolved = widget.ticket.status == 'resolved';

    return Scaffold(
      appBar: AppBar(
        title: Text('Ticket: ${widget.ticket.issueTitle}'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            const Tab(
              icon: Icon(Icons.chat),
              text: 'Chat',
            ),
            if (isAdmin && !isResolved)
              const Tab(
                icon: Icon(Icons.reply),
                text: 'Final Reply',
              ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Chat Tab
          TicketChatScreen(ticket: widget.ticket),
          
          // Final Reply Tab (only for admin and unresolved tickets)
          if (isAdmin && !isResolved)
            _buildReplyForm(),
        ],
      ),
    );
  }

  Widget _buildReplyForm() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: ListView(
          children: [
            // Ticket Information
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ticket Information',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text('Issue: ${widget.ticket.issueTitle}'),
                    const SizedBox(height: 4),
                    Text('Description: ${widget.ticket.description}'),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text('Status: ${widget.ticket.status.toUpperCase()}'),
                        const Spacer(),
                        _buildStatusChip(widget.ticket.status),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Reply Form
            Text(
              'Send Final Reply',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _doctorNameController,
              decoration: const InputDecoration(
                labelText: 'Doctor Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
              validator: (v) => v!.isEmpty ? 'Enter doctor name' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _doctorPhoneController,
              decoration: const InputDecoration(
                labelText: 'Doctor Phone Number',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
              validator: (v) => v!.isEmpty ? 'Enter doctor phone' : null,
            ),
            const SizedBox(height: 16),
            
            DropdownButtonFormField<String>(
              value: _selectedSpecialization,
              items: _specializations.map((s) => DropdownMenuItem(
                value: s, 
                child: Text(s),
              )).toList(),
              onChanged: (v) => setState(() => _selectedSpecialization = v),
              decoration: const InputDecoration(
                labelText: 'Specialization',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.medical_services),
              ),
              validator: (v) => v == null ? 'Select specialization' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _replyMessageController,
              decoration: const InputDecoration(
                labelText: 'Reply Message',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.message),
              ),
              maxLines: 5,
              validator: (v) => v!.isEmpty ? 'Enter reply message' : null,
            ),
            const SizedBox(height: 24),
            
            Consumer<TicketProvider>(
              builder: (context, ticketProvider, child) {
                return ticketProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton.icon(
                        onPressed: _submitReply,
                        icon: const Icon(Icons.send),
                        label: const Text('Send Final Reply'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          textStyle: const TextStyle(fontSize: 16),
                        ),
                      );
              },
            ),
            
            const SizedBox(height: 16),
            
            Text(
              'Note: Sending a final reply will resolve this ticket.',
              style: TextStyle(
                color: Colors.orange[700],
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;
    String text;

    switch (status) {
      case 'resolved':
        backgroundColor = Colors.green[100]!;
        textColor = Colors.green[800]!;
        text = 'Resolved';
        break;
      case 'assigned':
        backgroundColor = Colors.blue[100]!;
        textColor = Colors.blue[800]!;
        text = 'Assigned';
        break;
      default:
        backgroundColor = Colors.orange[100]!;
        textColor = Colors.orange[800]!;
        text = 'Pending';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
