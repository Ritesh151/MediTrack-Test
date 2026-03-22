import 'package:flutter/material.dart';

class AppColors {
  // Premium Off-White Theme Colors
  static const Color background = Color(0xFFF8F9FA); // Off-White/Ghost White
  static const Color surface = Color(0xFFFFFFFF); // Pure White
  static const Color cardBorder = Color(0xFFE0E0E0); // Subtle border

  // Professional Medical Colors
  static const Color primary = Color(0xFF0056D2); // Professional Medical Blue
  static const Color primaryLight = Color(0xFFE6F3FF); // Light blue tint
  static const Color secondary = Color(0xFF008080); // Professional Teal

  // Text Colors
  static const Color textPrimary = Color(0xFF1A1A1B); // Dark Slate
  static const Color textSecondary = Color(0xFF6B7280); // Medium Grey
  static const Color textTertiary = Color(0xFF9CA3AF); // Light Grey

  // UI Elements
  static const Color border = Color(0xFFE5E7EB);
  static const Color divider = Color(0xFFEDEDED);
  static const Color shadow = Color(0x0A000000); // Very subtle shadow

  // Status Colors
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Gradient Colors
  static const List<Color> primaryGradient = [
    Color(0xFF0056D2),
    Color(0xFF0077CC),
  ];
  
  static const List<Color> cardGradient = [
    Color(0xFFFFFFFF),
    Color(0xFFFAFBFC),
  ];

  // Shimmer Colors
  static const Color shimmerBase = Color(0xFFF0F0F0);
  static const Color shimmerHighlight = Color(0xFFF8F8F8);
}
