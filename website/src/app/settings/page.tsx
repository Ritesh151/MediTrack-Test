'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHospitals } from '@/context/HospitalContext';
import { Navbar } from '@/components/Navbar';
import { ProfileHeader, SettingTile, SettingSection } from '@/components/SettingTile';
import { SettingsShimmer } from '@/components/Shimmer';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout, updateUserHospital } = useAuth();
  const { hospitals, loadHospitals, searchQuery, setSearchQuery } = useHospitals();
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && hospitals.length === 0) {
      loadHospitals();
    }
  }, [user]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      alert('Email copied to clipboard');
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      router.push('/login');
    }
  };

  const currentHospital = user?.hospitalId 
    ? hospitals.find(h => (h._id || h.id) === user.hospitalId)
    : null;

  const filteredHospitals = hospitalSearch
    ? hospitals.filter(h => 
        h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
        h.city.toLowerCase().includes(hospitalSearch.toLowerCase())
      )
    : hospitals;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'patient': return 'Patient';
      case 'admin': return 'Hospital Admin';
      case 'super': return 'Super User';
      default: return 'User';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto p-4 pt-8">
          <SettingsShimmer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant={user.role as 'patient' | 'admin' | 'super'} />
      
      <main className="max-w-3xl mx-auto p-4 pt-8">
        <ProfileHeader
          name={user.name}
          email={user.email}
          role={getRoleLabel(user.role)}
          onCopyEmail={handleCopyEmail}
        />

        <div className="mt-6 space-y-6">
          {user.role === 'patient' && (
            <>
              <SettingSection title="Account">
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  title="My Hospital"
                  subtitle={currentHospital?.name || 'Select Hospital'}
                  iconColor="text-secondary"
                  onClick={() => setShowHospitalModal(true)}
                />
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Ticket History"
                  subtitle="View your support tickets"
                  iconColor="text-info"
                  onClick={() => router.push('/ticket-history')}
                />
              </SettingSection>

              <SettingSection title="Support">
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Help Center"
                  subtitle="Get help and support"
                  iconColor="text-warning"
                  onClick={() => setShowHelpModal(true)}
                />
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  title="Contact Support"
                  subtitle="Reach our support team"
                  iconColor="text-primary"
                  onClick={() => setShowContactModal(true)}
                />
              </SettingSection>
            </>
          )}

          {user.role === 'admin' && (
            <SettingSection title="Hospital Management">
              <SettingTile
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                title="Hospital Profile"
                subtitle="Manage hospital details"
                iconColor="text-secondary"
              />
              <SettingTile
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                title="Assigned Tickets"
                subtitle="View and manage tickets"
                iconColor="text-info"
                onClick={() => router.push('/admin')}
              />
              <SettingTile
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Availability Status"
                subtitle={availabilityStatus ? 'Active' : 'Away'}
                iconColor="text-success"
                trailing={
                  <button
                    onClick={() => setAvailabilityStatus(!availabilityStatus)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      availabilityStatus ? 'bg-success' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        availabilityStatus ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                }
                showArrow={false}
              />
              <SettingTile
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Quick Stats"
                subtitle="View hospital statistics"
                iconColor="text-warning"
              />
            </SettingSection>
          )}

          {user.role === 'super' && (
            <>
              <SettingSection title="System Management">
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  title="Global Analytics"
                  subtitle="System-wide statistics"
                  iconColor="text-primary"
                />
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  title="Manage All Hospitals"
                  subtitle="Hospital administration"
                  iconColor="text-secondary"
                  onClick={() => router.push('/super')}
                />
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  }
                  title="Admin Audit Logs"
                  subtitle="System activity logs"
                  iconColor="text-warning"
                />
              </SettingSection>

              <SettingSection title="Configuration">
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  }
                  title="API Status"
                  subtitle="All systems operational"
                  iconColor="text-success"
                  trailing={
                    <span className="px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                      Online
                    </span>
                  }
                  showArrow={false}
                />
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Maintenance Mode"
                  subtitle="System maintenance"
                  iconColor="text-warning"
                  trailing={
                    <button
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        maintenanceMode ? 'bg-warning' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  }
                  showArrow={false}
                />
                <SettingTile
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  }
                  title="Database Backups"
                  subtitle="Manage system backups"
                  iconColor="text-info"
                />
              </SettingSection>
            </>
          )}

          <SettingSection title="App Preferences">
            <SettingTile
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Language"
              subtitle="English"
              iconColor="text-text-secondary"
              showArrow={false}
            />
            <SettingTile
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
              title="Notifications"
              subtitle="Manage app notifications"
              iconColor="text-text-secondary"
              trailing={
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-success' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              }
              showArrow={false}
            />
            <SettingTile
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
              title="Dark Mode"
              subtitle="Toggle app theme"
              iconColor="text-text-secondary"
              trailing={
                <button
                  onClick={handleDarkModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              }
              showArrow={false}
            />
          </SettingSection>

          <SettingSection title="About">
            <SettingTile
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="App Version"
              subtitle="MediTrack Pro v2.0.0"
              iconColor="text-text-secondary"
              showArrow={false}
            />
            <SettingTile
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Privacy Policy"
              subtitle="View our privacy policy"
              iconColor="text-info"
            />
            <SettingTile
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Terms of Service"
              subtitle="View our terms"
              iconColor="text-info"
            />
          </SettingSection>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-4 bg-error text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            LOG OUT
          </button>
        </div>
      </main>

      {showHospitalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-card-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">Select Hospital</h2>
              <button onClick={() => setShowHospitalModal(false)} className="text-text-tertiary hover:text-text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 border-b border-card-border">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-2">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital._id || hospital.id}
                  onClick={async () => {
                    try {
                      await updateUserHospital(hospital._id || hospital.id);
                      setShowHospitalModal(false);
                      alert(`Hospital updated to ${hospital.name}`);
                    } catch (err) {
                      alert('Failed to update hospital');
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    (hospital._id || hospital.id) === user.hospitalId
                      ? 'border-primary bg-primary/5'
                      : 'border-card-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{hospital.name}</p>
                      <p className="text-sm text-text-secondary">{hospital.city}, {hospital.address}</p>
                    </div>
                    {(hospital._id || hospital.id) === user.hospitalId && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredHospitals.length === 0 && (
                <p className="text-center text-text-secondary py-8">No hospitals found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-card-border">
              <h2 className="text-xl font-bold text-text-primary">Help & Support</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Email Support</p>
                  <p className="text-sm text-text-secondary">support@meditrack.pro</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Phone Support</p>
                  <p className="text-sm text-text-secondary">+91 8980614160</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Live Chat</p>
                  <p className="text-sm text-text-secondary">Available 24/7</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary text-center pt-4">
                Our support team is available 24/7 to help you with any issues or questions.
              </p>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-3 border border-card-border rounded-xl text-text-secondary font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 animate-slide-up">
            <div className="p-6 border-b border-card-border">
              <h2 className="text-xl font-bold text-text-primary">Contact Support</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-text-secondary">Get in touch with our support team:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-secondary">Email</p>
                    <p className="text-sm text-text-primary">support@meditrack.pro</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-secondary">Phone</p>
                    <p className="text-sm text-text-primary">+91 8980614160</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-secondary">Address</p>
                    <p className="text-sm text-text-primary">123 Medical Center, Delhi</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-3 border border-card-border rounded-xl text-text-secondary font-semibold hover:bg-gray-50 transition-colors mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
