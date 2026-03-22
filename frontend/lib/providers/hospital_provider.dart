import 'package:flutter/material.dart';
import '../data/models/hospital_model.dart';
import '../data/repositories/hospital_repository.dart';

class HospitalProvider extends ChangeNotifier {
  final HospitalRepository _repository = HospitalRepository();

  List<HospitalModel> _hospitals = [];
  String _searchQuery = "";
  bool _isLoading = false;
  Object? _error;

  List<HospitalModel> get hospitals {
    if (_searchQuery.isEmpty) return _hospitals;
    return _hospitals.where((h) {
      final nameMatches = h.name.toLowerCase().contains(_searchQuery.toLowerCase());
      final cityMatches = h.city.toLowerCase().contains(_searchQuery.toLowerCase());
      return nameMatches || cityMatches;
    }).toList();
  }

  bool get isLoading => _isLoading;
  Object? get error => _error;

  Map<String, int> get hospitalTypeCount {
    final counts = <String, int>{
      'GOV': 0,
      'PRIVATE': 0,
      'SEMI': 0,
    };

    for (final h in _hospitals) {
      final raw = h.type;
      final normalized = raw.trim().toUpperCase();
      if (normalized.isEmpty) continue;

      if (normalized == 'GOV' || normalized == 'GOVERNMENT') {
        counts['GOV'] = (counts['GOV'] ?? 0) + 1;
        continue;
      }

      if (normalized == 'PRIVATE') {
        counts['PRIVATE'] = (counts['PRIVATE'] ?? 0) + 1;
        continue;
      }

      if (normalized == 'SEMI' || normalized == 'SEMI-GOV' || normalized == 'SEMIGOV' || normalized == 'SEMI-GOVERNMENT') {
        counts['SEMI'] = (counts['SEMI'] ?? 0) + 1;
        continue;
      }
    }

    return counts;
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadHospitals() async {
    _setLoading(true);
    _setError(null);
    try {
      _hospitals = await _repository.fetchHospitals();
      notifyListeners();
    } catch (e) {
      _setError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> addHospital(String name, String type, String address, String city) async {
    _setLoading(true);
    _setError(null);
    try {
      final created = await _repository.addHospital(name, type, address, city);

      // Real-time update strategy: mutate local list immediately.
      _hospitals = [..._hospitals, created];
      notifyListeners();

      // Fallback reconciliation (kept lightweight): refresh authoritative list.
      // Do not toggle loading again to avoid UI flicker.
      final refreshed = await _repository.fetchHospitals();
      _hospitals = refreshed;
      notifyListeners();
    } catch (e) {
      _setError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> removeHospital(String id) async {
    _setLoading(true);
    _setError(null);
    try {
      await _repository.deleteHospital(id);
      _hospitals = _hospitals.where((h) => h.id != id).toList();
      notifyListeners();

      final refreshed = await _repository.fetchHospitals();
      _hospitals = refreshed;
      notifyListeners();
    } catch (e) {
      _setError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(Object? value) {
    _error = value;
    notifyListeners();
  }
}
