/**
 * Project Layout
 * Wraps project pages with common layout
 */

import React from 'react';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full">{children}</div>;
}
