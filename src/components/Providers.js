'use client';

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000, // 30 minutes - data stays fresh longer
        gcTime: 60 * 60 * 1000, // 60 minutes (1 hour) - cache kept for 1 hour
        cacheTime: 60 * 60 * 1000, // 60 minutes (backwards compatibility)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
