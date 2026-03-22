import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ticket_provider.dart';
import './ticket_reply_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> with RouteAware {
  @override
  void initState() {
    super.initState();
    // Load tickets when dashboard first opens
    Future.microtask(() => _loadTickets());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  /// Called every time this route becomes visible again (e.g. after returning
  /// from TicketReplyScreen), so assigned tickets are always fresh.
  @override
  void didPopNext() {
    _loadTickets();
  }

  void _loadTickets() {
    if (mounted) {
      context.read<TicketProvider>().loadTickets();
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          // Manual refresh button so admin can pull latest tickets anytime
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh tickets',
            onPressed: _loadTickets,
          ),
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.tickets.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          // Show error message if any
          if (provider.errorMessage != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading tickets',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      provider.errorMessage!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.red[600]),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadTickets,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (user == null) {
            return const Center(
              child: Text(
                'Admin credentials are missing. Please log in again.',
              ),
            );
          }

          // Pull-to-refresh support
          return RefreshIndicator(
            onRefresh: () => context.read<TicketProvider>().loadTickets(),
            child: provider.tickets.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildProfileCard(user),
                      const SizedBox(height: 16),
                      _buildEmptyState(),
                    ],
                  )
                : ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildProfileCard(user),
                      const SizedBox(height: 16),
                      _buildTicketsHeader(provider.tickets.length),
                      ...provider.tickets.map((ticket) {
                        return _buildTicketCard(ticket, user);
                      }),
                    ],
                  ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 32),
        child: Column(
          children: [
            Icon(Icons.inbox_outlined,
                size: 64, color: Colors.grey[400]),
            const SizedBox(height: 12),
            Text(
              'No assigned tickets yet',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Pull down to refresh',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTicketsHeader(int ticketCount) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.assignment, 
               color: Theme.of(context).primaryColor, size: 20),
          const SizedBox(width: 8),
          Text(
            '$ticketCount Assigned Ticket${ticketCount == 1 ? '' : 's'}',
            style: TextStyle(
              color: Theme.of(context).primaryColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketCard(TicketModel ticket, dynamic user) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12.0),
      elevation: 2,
      child: InkWell(
        onTap: ticket.status != 'resolved' ? () => _navigateToReply(ticket) : null,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _statusIcon(ticket.status),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      ticket.issueTitle,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  if (ticket.status != 'resolved')
                    IconButton(
                      icon: const Icon(Icons.reply, size: 20),
                      tooltip: 'Reply to ticket',
                      onPressed: () => _navigateToReply(ticket),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              if (ticket.patient != null) ...[
                Row(
                  children: [
                    Icon(Icons.person, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text(
                      'Patient: ${ticket.patient!['name'] ?? 'Unknown'}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
              ],
              Row(
                children: [
                  Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    'Created: ${DateFormat('MMM dd, yyyy').format(ticket.createdAt)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  _buildStatusChip(ticket.status),
                ],
              ),
            ],
          ),
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

  void _navigateToReply(TicketModel ticket) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TicketReplyScreen(ticket: ticket),
      ),
    ).then((_) => _loadTickets());
  }

  Widget _buildProfileCard(dynamic user) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.admin_panel_settings, 
                     color: Theme.of(context).primaryColor),
                const SizedBox(width: 8),
                Text(
                  'Admin Profile',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildProfileRow('Name', user.name),
            _buildProfileRow('Email', user.email),
            _buildProfileRow('Role', user.role),
            _buildProfileRow(
              'Permissions', 
              user.permissions.isEmpty ? 'None' : user.permissions.join(', ')
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statusIcon(String status) {
    switch (status) {
      case 'resolved':
        return const Icon(Icons.check_circle, color: Colors.green, size: 20);
      case 'assigned':
        return const Icon(Icons.assignment_ind, color: Colors.blue, size: 20);
      default:
        return const Icon(Icons.pending_outlined, color: Colors.orange, size: 20);
    }
  }
}
