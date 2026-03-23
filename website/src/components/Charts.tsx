'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface TicketStatusChartProps {
  tickets: any[];
}

export function TicketStatusChart({ tickets }: TicketStatusChartProps) {
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const inProgress = tickets.filter((t) => t.status === 'in-progress' || t.status === 'assigned').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  const data = [
    { name: 'Pending', value: pending, color: '#F59E0B' },
    { name: 'In Progress', value: inProgress, color: '#3B82F6' },
    { name: 'Resolved', value: resolved, color: '#16A34A' },
  ];

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-card-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">Ticket Status Distribution</h3>
        <div className="h-64 flex items-center justify-center text-text-tertiary">
          No ticket data for visualization
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-card-border">
      <h3 className="text-lg font-bold text-text-primary mb-4">Ticket Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface HospitalTypeChartProps {
  counts: { GOV: number; PRIVATE: number; SEMI: number };
}

export function HospitalTypeChart({ counts }: HospitalTypeChartProps) {
  const data = [
    { name: 'Government', value: counts.GOV, color: '#9333EA' },
    { name: 'Private', value: counts.PRIVATE, color: '#3B82F6' },
    { name: 'Semi-Gov', value: counts.SEMI, color: '#F59E0B' },
  ];

  const maxValue = Math.max(counts.GOV, counts.PRIVATE, counts.SEMI, 1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-card-border">
      <h3 className="text-lg font-bold text-text-primary mb-4">Hospital Types Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" domain={[0, maxValue + 1]} hide />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-card-border">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-secondary">{title}</p>
        </div>
      </div>
    </div>
  );
}
