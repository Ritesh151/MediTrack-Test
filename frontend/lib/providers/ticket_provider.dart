import 'package:flutter/material.dart';
import '../data/models/ticket_model.dart';
import '../data/repositories/ticket_repository.dart';

class TicketProvider extends ChangeNotifier {
  final TicketRepository _repository = TicketRepository();

  List<TicketModel> _tickets = [];
  List<TicketModel> _pendingTickets = [];
  Map<String, dynamic> _stats = {};
  String _searchQuery = "";
  bool _isLoading = false;
  String? _errorMessage;

  List<TicketModel> get tickets {
    if (_searchQuery.isEmpty) return _tickets;
    return _tickets.where((t) =>
      t.issueTitle.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      (t.patient != null && t.patient!['name']?.toString().toLowerCase().contains(_searchQuery.toLowerCase()) == true)
    ).toList();
  }

  List<TicketModel> get pendingTickets => _pendingTickets;
  Map<String, dynamic> get stats => _stats;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get error => _errorMessage;

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadTickets() async {
    _setLoading(true);
    _clearError();
    try {
      _tickets = await _repository.fetchTickets();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load tickets: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadPendingTickets() async {
    _setLoading(true);
    _clearError();
    try {
      _pendingTickets = await _repository.fetchPendingTickets();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load pending tickets: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> createTicket(String issueTitle, String description) async {
    if (issueTitle.trim().isEmpty || description.trim().isEmpty) {
      _setError('Title and description are required');
      return;
    }

    _setLoading(true);
    _clearError();
    try {
      await _repository.createTicket(issueTitle.trim(), description.trim());
      await loadTickets(); // Refresh the list
    } catch (e) {
      _setError('Failed to create ticket: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> assignTicket(String ticketId, String adminId) async {
    _setLoading(true);
    _clearError();
    try {
      await _repository.assignTicket(ticketId, adminId);
      // Refresh both lists to keep UI consistent
      await Future.wait([
        loadPendingTickets(),
        loadTickets(),
      ]);
    } catch (e) {
      _setError('Failed to assign ticket: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> updateStatus(String id, String status, bool assignCaseNumber) async {
    _setLoading(true);
    _clearError();
    try {
      await _repository.updateTicket(id, status, assignCaseNumber);
      await loadTickets();
    } catch (e) {
      _setError('Failed to update ticket status: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> replyToTicket(String ticketId, Map<String, dynamic> replyData) async {
    _setLoading(true);
    _clearError();
    try {
      await _repository.replyToTicket(ticketId, replyData);
      await loadTickets(); // Refresh to show updated status
    } catch (e) {
      _setError('Failed to reply to ticket: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> deleteTicket(String id) async {
    _setLoading(true);
    _clearError();
    try {
      await _repository.deleteTicket(id);
      await loadTickets();
    } catch (e) {
      _setError('Failed to delete ticket: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadStats() async {
    _setLoading(true);
    _clearError();
    try {
      _stats = await _repository.fetchStats();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load statistics: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<TicketModel> getTicketDetails(String id) async {
    return await _repository.fetchTicketDetails(id);
  }

  Future<void> fetchUserTickets() async {
    _setLoading(true);
    _clearError();
    try {
      _tickets = await _repository.fetchUserTickets();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load user tickets: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // Refresh all data - useful for pull-to-refresh
  Future<void> refreshAll() async {
    await Future.wait([
      loadTickets(),
      loadPendingTickets(),
      loadStats(),
    ]);
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
