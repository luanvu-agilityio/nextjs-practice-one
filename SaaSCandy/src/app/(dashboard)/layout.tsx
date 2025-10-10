import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>) {
  return <div>{children}</div>;
}
