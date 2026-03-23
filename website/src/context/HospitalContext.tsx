'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Hospital } from '@/lib/types';
import { hospitalService } from '@/services';

interface HospitalTypeCount {
  GOV: number;
  PRIVATE: number;
  SEMI: number;
}

interface HospitalContextType {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  hospitalTypeCount: HospitalTypeCount;
  setSearchQuery: (query: string) => void;
  loadHospitals: () => Promise<void>;
  addHospital: (data: { name: string; type: string; address: string; city: string }) => Promise<void>;
  updateHospital: (id: string, data: Partial<Hospital>) => Promise<void>;
  removeHospital: (id: string) => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hospitalService.getAll();
      setHospitals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHospital = useCallback(async (data: { name: string; type: string; address: string; city: string }) => {
    setIsLoading(true);
    try {
      const newHospital = await hospitalService.create(data);
      setHospitals(prev => [...prev, newHospital]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateHospital = useCallback(async (id: string, data: Partial<Hospital>) => {
    setIsLoading(true);
    try {
      const updated = await hospitalService.update(id, data);
      setHospitals(prev => prev.map(h => (h._id || h.id) === id ? updated : h));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeHospital = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await hospitalService.delete(id);
      setHospitals(prev => prev.filter(h => (h._id || h.id) !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hospitalTypeCount = hospitals.reduce(
    (acc, h) => {
      const type = h.type.toUpperCase();
      if (type === 'GOV' || type === 'GOVERNMENT') acc.GOV++;
      else if (type === 'PRIVATE') acc.PRIVATE++;
      else if (type.includes('SEMI')) acc.SEMI++;
      return acc;
    },
    { GOV: 0, PRIVATE: 0, SEMI: 0 }
  );

  const filteredHospitals = searchQuery
    ? hospitals.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : hospitals;

  return (
    <HospitalContext.Provider
      value={{
        hospitals: filteredHospitals,
        isLoading,
        error,
        searchQuery,
        hospitalTypeCount,
        setSearchQuery,
        loadHospitals,
        addHospital,
        updateHospital,
        removeHospital,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospitals() {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospitals must be used within a HospitalProvider');
  }
  return context;
}

export default HospitalContext;
