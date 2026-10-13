import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Staff portal | Prachi Dham Foundation',
  description: 'Private Prachi Dham Foundation staff access.',
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: ReactNode }) {
  return children;
}
