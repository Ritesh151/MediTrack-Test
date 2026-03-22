import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../widgets/setting_tile.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final hospitalProvider = Provider.of<HospitalProvider>(context);
    final user = authProvider.user;
    final userRole = user?.role?.toLowerCase() ?? 'patient';

    // Load hospitals if not already loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (hospitalProvider.hospitals.isEmpty && !hospitalProvider.isLoading) {
        hospitalProvider.loadHospitals();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'Settings',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Header
          ProfileHeader(
            name: user?.name ?? 'User',
            email: user?.email ?? 'user@meditrack.pro',
            role: _getFormattedRole(userRole),
            onCopyEmail: () {
              Clipboard.setData(
                ClipboardData(text: user?.email ?? 'user@meditrack.pro'),
              );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Email copied to clipboard'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            onEditProfile: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Profile editing coming soon'),
                  backgroundColor: AppColors.info,
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Role-based sections
          if (userRole == 'patient') ..._buildPatientSections(context),
          if (userRole == 'admin') ..._buildAdminSections(context),
          if (userRole == 'super') ..._buildSuperUserSections(context),

          // Common sections for all roles
          ..._buildCommonSections(context, authProvider),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  String _getFormattedRole(String role) {
    switch (role) {
      case 'patient':
        return 'Patient';
      case 'admin':
        return 'Hospital Admin';
      case 'super':
        return 'Super User';
      default:
        return 'User';
    }
  }

  // Patient-specific sections
  List<Widget> _buildPatientSections(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final hospitalProvider = Provider.of<HospitalProvider>(context);
    final user = authProvider.user;
    
    final currentHospitalId = user?.hospitalId;
    final currentHospital = hospitalProvider.hospitals
        .where((h) => h.id == currentHospitalId)
        .firstOrNull;

    return [
      // Account Section
      SettingSection(
        title: 'Account',
        children: [
          SettingTile(
            icon: Icons.local_hospital_outlined,
            title: 'My Hospital',
            subtitle: currentHospital?.name ?? 'Select Hospital',
            iconColor: AppColors.secondary,
            onTap: () => _showHospitalSelectionBottomSheet(context),
          ),
          SettingTile(
            icon: Icons.history_outlined,
            title: 'Ticket History',
            subtitle: 'View your support tickets',
            iconColor: AppColors.info,
            onTap: () {
              Navigator.pushNamed(context, '/ticket-history');
            },
          ),
        ],
      ),

      // Support Section
      SettingSection(
        title: 'Support',
        children: [
          SettingTile(
            icon: Icons.help_outline,
            title: 'Help Center',
            subtitle: 'Get help and support',
            iconColor: AppColors.warning,
            onTap: () => _showHelpCenter(context),
          ),
          SettingTile(
            icon: Icons.contact_support_outlined,
            title: 'Contact Support',
            subtitle: 'Reach our support team',
            iconColor: AppColors.primary,
            onTap: () => _showContactSupport(context),
          ),
        ],
      ),
    ];
  }

  // Admin-specific sections
  List<Widget> _buildAdminSections(BuildContext context) {
    return [
      // Hospital Management Section
      SettingSection(
        title: 'Hospital Management',
        children: [
          SettingTile(
            icon: Icons.business_outlined,
            title: 'Hospital Profile',
            subtitle: 'Manage hospital details',
            iconColor: AppColors.secondary,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Hospital profile management coming soon')),
              );
            },
          ),
          SettingTile(
            icon: Icons.toggle_on_outlined,
            title: 'Availability Status',
            subtitle: 'Active',
            trailing: Switch(
              value: true,
              onChanged: (value) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Status updated to ${value ? "Active" : "Away"}')),
                );
              },
              activeColor: AppColors.success,
            ),
            showArrow: false,
          ),
          SettingTile(
            icon: Icons.assignment_outlined,
            title: 'Assigned Tickets',
            subtitle: 'View and manage tickets',
            iconColor: AppColors.info,
            onTap: () {
              Navigator.pushNamed(context, '/admin/tickets');
            },
          ),
          SettingTile(
            icon: Icons.analytics_outlined,
            title: 'Quick Stats',
            subtitle: 'View hospital statistics',
            iconColor: AppColors.warning,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Analytics dashboard coming soon')),
              );
            },
          ),
        ],
      ),
    ];
  }

  // Super User-specific sections
  List<Widget> _buildSuperUserSections(BuildContext context) {
    return [
      // System Management Section
      SettingSection(
        title: 'System Management',
        children: [
          SettingTile(
            icon: Icons.analytics_outlined,
            title: 'Global Analytics',
            subtitle: 'System-wide statistics',
            iconColor: AppColors.primary,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Global analytics coming soon')),
              );
            },
          ),
          SettingTile(
            icon: Icons.location_city_outlined,
            title: 'Manage All Hospitals',
            subtitle: 'Hospital administration',
            iconColor: AppColors.secondary,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Hospital management coming soon')),
              );
            },
          ),
          SettingTile(
            icon: Icons.admin_panel_settings_outlined,
            title: 'Admin Audit Logs',
            subtitle: 'System activity logs',
            iconColor: AppColors.warning,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Audit logs coming soon')),
              );
            },
          ),
        ],
      ),

      // Configuration Section
      SettingSection(
        title: 'Configuration',
        children: [
          SettingTile(
            icon: Icons.api_outlined,
            title: 'API Status',
            subtitle: 'All systems operational',
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Online',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.success,
                ),
              ),
            ),
            showArrow: false,
          ),
          SettingTile(
            icon: Icons.build_outlined,
            title: 'Maintenance Mode',
            subtitle: 'System maintenance',
            trailing: Switch(
              value: false,
              onChanged: (value) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Maintenance mode ${value ? "enabled" : "disabled"}')),
                );
              },
              activeColor: AppColors.warning,
            ),
            showArrow: false,
          ),
          SettingTile(
            icon: Icons.storage_outlined,
            title: 'Database Backups',
            subtitle: 'Manage system backups',
            iconColor: AppColors.info,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Backup management coming soon')),
              );
            },
          ),
        ],
      ),
    ];
  }

  // Common sections for all roles
  List<Widget> _buildCommonSections(BuildContext context, AuthProvider authProvider) {
    return [
      // App Preferences Section
      SettingSection(
        title: 'App Preferences',
        children: [
          SettingTile(
            icon: Icons.language_outlined,
            title: 'Language',
            subtitle: 'English',
            trailing: DropdownButton<String>(
              value: 'English',
              underline: const SizedBox(),
              icon: Icon(
                Icons.keyboard_arrow_down,
                color: AppColors.textTertiary,
                size: 20,
              ),
              items: <String>['English', 'Spanish', 'French', 'Hindi']
                  .map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(
                    value,
                    style: GoogleFonts.poppins(fontSize: 13),
                  ),
                );
              }).toList(),
              onChanged: (String? newValue) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Language changed to $newValue')),
                );
              },
            ),
            showArrow: false,
          ),
          SettingTile(
            icon: Icons.notifications_outlined,
            title: 'Notifications',
            subtitle: 'Manage app notifications',
            trailing: Switch(
              value: true,
              onChanged: (value) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Notifications ${value ? "enabled" : "disabled"}')),
                );
              },
              activeColor: AppColors.success,
            ),
            showArrow: false,
          ),
          SettingTile(
            icon: Icons.dark_mode_outlined,
            title: 'Dark Mode',
            subtitle: 'Toggle app theme',
            trailing: Switch(
              value: false,
              onChanged: (value) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Dark mode ${value ? "enabled" : "disabled"}')),
                );
              },
              activeColor: AppColors.primary,
            ),
            showArrow: false,
          ),
        ],
      ),

      // About Section
      SettingSection(
        title: 'About',
        children: [
          SettingTile(
            icon: Icons.info_outline,
            title: 'App Version',
            subtitle: 'MediTrack Pro v2.0.0',
            showArrow: false,
          ),
          SettingTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            iconColor: AppColors.info,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Privacy policy coming soon')),
              );
            },
          ),
          SettingTile(
            icon: Icons.description_outlined,
            title: 'Terms of Service',
            iconColor: AppColors.info,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Terms of service coming soon')),
              );
            },
          ),
        ],
      ),

      // Logout Button
      Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        child: ElevatedButton.icon(
          onPressed: () => _showLogoutDialog(context, authProvider),
          icon: const Icon(Icons.logout, size: 18),
          label: Text(
            'LOG OUT',
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.w600,
              letterSpacing: 1.0,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    ];
  }

  void _showHelpCenter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Help & Support',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 20),
            SettingTile(
              icon: Icons.email_outlined,
              title: 'Email Support',
              subtitle: 'support@meditrack.pro',
              iconColor: AppColors.primary,
              showArrow: false,
            ),
            SettingTile(
              icon: Icons.phone_outlined,
              title: 'Phone Support',
              subtitle: '+91 8980614160',
              iconColor: AppColors.success,
              showArrow: false,
            ),
            SettingTile(
              icon: Icons.chat_outlined,
              title: 'Live Chat',
              subtitle: 'Available 24/7',
              iconColor: AppColors.info,
              showArrow: false,
            ),
            const SizedBox(height: 16),
            Text(
              'Our support team is available 24/7 to help you with any issues or questions.',
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showContactSupport(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(
          'Contact Support',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Get in touch with our support team:',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            _buildContactItem(Icons.email, 'Email', 'support@meditrack.pro'),
            _buildContactItem(Icons.phone, 'Phone', '+91 8980614160'),
            _buildContactItem(Icons.location_on, 'Address', '123 Medical Center, Delhi'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Close',
              style: GoogleFonts.poppins(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(
          'Logout',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        content: Text(
          'Are you sure you want to logout?',
          style: GoogleFonts.poppins(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: GoogleFonts.poppins(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              authProvider.logout().then((_) {
                Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
              });
            },
            child: Text(
              'Logout',
              style: GoogleFonts.poppins(
                color: AppColors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showHospitalSelectionBottomSheet(BuildContext context) {
    final hospitalProvider = Provider.of<HospitalProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentHospitalId = authProvider.user?.hospitalId;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => DraggableScrollableSheet(
          initialChildSize: 0.7,
          minChildSize: 0.5,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) => Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Row(
                  children: [
                    Text(
                      'Select Hospital',
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Search Bar
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: TextField(
                    onChanged: (value) {
                      hospitalProvider.setSearchQuery(value);
                      setState(() {});
                    },
                    decoration: InputDecoration(
                      hintText: 'Search hospitals...',
                      hintStyle: GoogleFonts.poppins(
                        color: AppColors.textTertiary,
                        fontSize: 14,
                      ),
                      prefixIcon: Icon(
                        Icons.search,
                        color: AppColors.textTertiary,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                
                // Hospital List
                Expanded(
                  child: hospitalProvider.isLoading
                      ? const Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                          ),
                        )
                      : hospitalProvider.error != null
                          ? Center(
                              child: Text(
                                'Error loading hospitals',
                                style: GoogleFonts.poppins(
                                  color: AppColors.error,
                                ),
                              ),
                            )
                          : ListView.builder(
                              controller: scrollController,
                              itemCount: hospitalProvider.hospitals.length,
                              itemBuilder: (context, index) {
                                final hospital = hospitalProvider.hospitals[index];
                                final isSelected = hospital.id == currentHospitalId;
                                
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? AppColors.primary.withValues(alpha: 0.1)
                                        : AppColors.surface,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSelected
                                          ? AppColors.primary
                                          : AppColors.cardBorder,
                                      width: isSelected ? 2 : 1,
                                    ),
                                  ),
                                  child: ListTile(
                                    contentPadding: const EdgeInsets.all(16),
                                    onTap: () async {
                                      if (isSelected) {
                                        Navigator.pop(context);
                                        return;
                                      }
                                      
                                      try {
                                        await authProvider.updateUserHospital(hospital.id);
                                        if (context.mounted) {
                                          Navigator.pop(context);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                'Hospital updated to ${hospital.name}',
                                              ),
                                              backgroundColor: AppColors.success,
                                            ),
                                          );
                                        }
                                      } catch (e) {
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                'Failed to update hospital: ${e.toString()}',
                                              ),
                                              backgroundColor: AppColors.error,
                                            ),
                                          );
                                        }
                                      }
                                    },
                                    leading: Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: AppColors.secondary.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Icon(
                                        Icons.local_hospital,
                                        color: AppColors.secondary,
                                        size: 20,
                                      ),
                                    ),
                                    title: Text(
                                      hospital.name,
                                      style: GoogleFonts.poppins(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? AppColors.primary
                                            : AppColors.textPrimary,
                                      ),
                                    ),
                                    subtitle: Text(
                                      '${hospital.city}, ${hospital.address}',
                                      style: GoogleFonts.poppins(
                                        fontSize: 12,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    trailing: isSelected
                                        ? Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary,
                                              borderRadius: BorderRadius.circular(20),
                                            ),
                                            child: const Icon(
                                              Icons.check,
                                              color: Colors.white,
                                              size: 16,
                                            ),
                                          )
                                        : null,
                                  ),
                                );
                              },
                            ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
