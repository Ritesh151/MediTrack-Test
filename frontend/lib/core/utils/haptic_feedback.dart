import 'package:vibration/vibration.dart';

class HapticFeedback {
  static void lightImpact() {
    Vibration.vibrate(duration: 50, amplitude: 50);
  }

  static void mediumImpact() {
    Vibration.vibrate(duration: 100, amplitude: 100);
  }

  static void heavyImpact() {
    Vibration.vibrate(duration: 150, amplitude: 200);
  }

  static void success() {
    Vibration.vibrate(duration: 50, amplitude: 100);
    Vibration.vibrate(duration: 50, amplitude: 150);
  }

  static void error() {
    Vibration.vibrate(duration: 100, amplitude: 200);
    Vibration.vibrate(duration: 100, amplitude: 100);
  }

  static void selection() {
    Vibration.vibrate(duration: 25, amplitude: 50);
  }

  static void warning() {
    Vibration.vibrate(duration: 200, amplitude: 150);
  }

  static Future<bool> get hasVibrator async {
    try {
      final result = await Vibration.hasVibrator();
      return result ?? false;
    } catch (e) {
      return false;
    }
  }
}
