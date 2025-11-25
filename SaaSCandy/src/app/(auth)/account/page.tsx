import { Metadata } from 'next';
import { AccountPageContent } from '@/features';

export const metadata: Metadata = {
  title: 'Account Details | SaaSCandy',
  description: 'Manage your account settings and profile information',
};

const AccountPage = () => {
  return <AccountPageContent />;
};
export default AccountPage;
