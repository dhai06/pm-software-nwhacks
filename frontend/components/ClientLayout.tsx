'use client';

import { CPMButton } from './CPMButton';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CPMButton />
    </>
  );
}
