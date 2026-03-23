'use client';

import { AuthProvider, TicketProvider, HospitalProvider, ChatProvider } from '@/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HospitalProvider>
        <TicketProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </TicketProvider>
      </HospitalProvider>
    </AuthProvider>
  );
}
