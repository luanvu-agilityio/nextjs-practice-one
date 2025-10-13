import { Metadata } from 'next';
import AccountPageContent from '@/components/AccountPageContent';

export const metadata: Metadata = {
  title: 'Account Details | SaaSCandy',
  description: 'Manage your account settings and profile information',
};

export default function AccountPage() {
  return <AccountPageContent />;
}
