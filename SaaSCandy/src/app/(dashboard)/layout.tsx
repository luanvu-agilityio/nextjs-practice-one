import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: Readonly<DashboardLayoutProps>) => {
  return <div>{children}</div>;
};

export default DashboardLayout;
