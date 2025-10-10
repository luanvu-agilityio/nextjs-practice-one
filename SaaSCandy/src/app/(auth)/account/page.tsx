import { Metadata } from 'next';
import AccountDetailPage from '@/components/AccountDetailPage';

export const metadata: Metadata = {
  title: 'Account Details | SaaSCandy',
  description: 'Manage your account settings and profile information',
};

export default function AccountPage() {
  return <AccountDetailPage />;
}
