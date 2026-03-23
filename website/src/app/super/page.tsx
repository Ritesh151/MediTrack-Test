'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHospitals } from '@/context/HospitalContext';
import { useTickets } from '@/context/TicketContext';
import { Navbar } from '@/components/Navbar';
import { HospitalTypeChart, StatCard } from '@/components/Charts';
import { DashboardShimmer } from '@/components/Shimmer';
import { CustomInput } from '@/components/CustomInput';

export default function SuperUserDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { hospitals, isLoading: hospitalsLoading, loadHospitals, addHospital, removeHospital, hospitalTypeCount } = useHospitals();
  const { tickets, loadTickets } = useTickets();
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [newHospital, setNewHospital] = useState({ name: '', type: 'gov', city: '', address: '' });
  const [adminData, setAdminData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'super')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'super') {
      loadHospitals();
      loadTickets();
    }
  }, [user]);

  const filteredHospitals = filterType === 'all' 
    ? hospitals 
    : hospitals.filter(h => h.type === filterType);

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHospital({ name: newHospital.name, type: newHospital.type, address: newHospital.address, city: newHospital.city });
      setShowAddModal(false);
      setNewHospital({ name: '', type: 'gov', city: '', address: '' });
    } catch (err) {
      console.error('Failed to add hospital:', err);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/assign-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...adminData, hospitalId: selectedHospitalId }),
      });
      
      if (response.ok) {
        setShowAssignAdminModal(false);
        setSelectedHospitalId('');
        setAdminData({ name: '', email: '', password: '' });
        alert('Admin assigned successfully');
      } else {
        throw new Error('Failed to assign admin');
      }
    } catch (err) {
      console.error('Failed to assign admin:', err);
      alert('Failed to assign admin');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar variant="super" />
        <main className="max-w-7xl mx-auto p-4 pt-8">
          <DashboardShimmer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="super" />
      
      <main className="max-w-7xl mx-auto p-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Super User Portal</h1>
        </div>

        <div className="bg-purple-50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <StatCard
              title="Tickets"
              value={tickets.length}
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="bg-blue-100"
            />
            <StatCard
              title="Hospitals"
              value={hospitals.length}
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              color="bg-purple-100"
            />
          </div>
          <HospitalTypeChart counts={hospitalTypeCount} />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search hospitals by name or city..."
            onChange={(e) => useHospitals().setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-card-border bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Registered Hospitals</h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-card-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="gov">Government</option>
            <option value="private">Private</option>
            <option value="semi">Semi-Gov</option>
          </select>
        </div>

        {hospitalsLoading ? (
          <DashboardShimmer />
        ) : filteredHospitals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-text-secondary">No hospitals found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital._id || hospital.id}
                className="bg-white rounded-xl border border-card-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">{hospital.name}</h3>
                  <p className="text-sm text-text-secondary">{hospital.type.toUpperCase()} • {hospital.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedHospitalId(hospital._id || hospital.id);
                      setShowAssignAdminModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Assign Admin"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this hospital?')) {
                        removeHospital(hospital._id || hospital.id);
                      }
                    }}
                    className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Hospital
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold text-text-primary mb-4">Add New Hospital</h2>
            
            <form onSubmit={handleAddHospital} className="space-y-4">
              <CustomInput
                label="Hospital Name"
                placeholder="Enter hospital name"
                value={newHospital.name}
                onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
              />
              
              <div className="w-full">
                <label className="block text-sm font-medium text-text-secondary mb-2">Hospital Type</label>
                <select
                  value={newHospital.type}
                  onChange={(e) => setNewHospital({ ...newHospital, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="gov">Government</option>
                  <option value="private">Private</option>
                  <option value="semi">Semi-Government</option>
                </select>
              </div>

              <CustomInput
                label="City"
                placeholder="Enter city"
                value={newHospital.city}
                onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
              />

              <CustomInput
                label="Address"
                placeholder="Enter address"
                value={newHospital.address}
                onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-card-border rounded-lg text-text-secondary font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold text-text-primary mb-4">Assign Hospital Admin</h2>
            
            <form onSubmit={handleAssignAdmin} className="space-y-4">
              <CustomInput
                label="Admin Name"
                placeholder="Enter admin name"
                value={adminData.name}
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
              />
              
              <CustomInput
                label="Admin Email"
                placeholder="Enter admin email"
                value={adminData.email}
                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                type="email"
              />

              <CustomInput
                label="Admin Password"
                placeholder="Enter admin password"
                value={adminData.password}
                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                type="password"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignAdminModal(false)}
                  className="flex-1 px-4 py-3 border border-card-border rounded-lg text-text-secondary font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
