import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../presentation/screens/splash/splash_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/auth/register_screen.dart';
import '../presentation/screens/patient/patient_dashboard.dart';
import '../presentation/screens/patient/ticket_history_screen.dart';
import '../presentation/screens/admin/admin_dashboard.dart';
import '../presentation/screens/super_user/super_user_dashboard.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/tickets/ticket_details_screen.dart';
import '../data/models/ticket_model.dart';

class AppRouter {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String patientDashboard = '/patient';
  static const String adminDashboard = '/admin';
  static const String superUserDashboard = '/super';
  static const String settingsRoute = '/settings';
  static const String ticketDetails = '/ticket-details';
  static const String ticketHistory = '/ticket-history';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    return MaterialPageRoute(
      builder: (context) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final isLoggedIn = authProvider.user != null;

        // Route guard helper
        Widget guardRoute(Widget route) {
          return isLoggedIn ? route : const LoginScreen();
        }

        switch (settings.name) {
          case splash:
            return const SplashScreen();
          case login:
            return const LoginScreen();
          case register:
            return const RegisterScreen();
          
          // Protected Routes
          case patientDashboard:
            return guardRoute(const PatientDashboard());
          case adminDashboard:
            return guardRoute(const AdminDashboard());
          case superUserDashboard:
            return guardRoute(const SuperUserDashboard());
          case settingsRoute:
            return guardRoute(const SettingsScreen());
          case ticketHistory:
            return guardRoute(const TicketHistoryScreen());
          case ticketDetails:
            if (!isLoggedIn) return const LoginScreen();
            final ticket = settings.arguments as TicketModel?;
            return TicketDetailsScreen(ticket: ticket);
            
          default:
            return Scaffold(
              backgroundColor: const Color(0xFFF8F9FA),
              appBar: AppBar(
                backgroundColor: const Color(0xFFF8F9FA),
                elevation: 0,
                title: const Text('Route Not Found'),
              ),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Color(0xFF0056D2),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No route defined for ${settings.name}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Color(0xFF1A1A1B),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pushNamedAndRemoveUntil(
                          '/patient',
                          (route) => false,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0056D2),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Go to Dashboard'),
                    ),
                  ],
                ),
              ),
            );
        }
      },
      settings: settings,
    );
  }
}
