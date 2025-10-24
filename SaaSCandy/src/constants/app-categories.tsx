// Icons
import {
  ShoppingBagIcon,
  SwapIcon,
  HealthIcon,
  ChartIcon,
  BankingIcon,
  BookIcon,
} from '@/icons';

export const appCategories = [
  {
    title: 'EdTech Apps',
    description:
      'Powerful tools that enhance learning experiences with interactive content, virtual classrooms, and performance tracking.',
    icon: <BookIcon className='w-15 h-15' />,
    href: '/services/edtech',
  },
  {
    title: 'eCommerce Apps',
    description:
      'Seamlessly manage online stores, process payments, and optimize customer experiences to drive sales and conversions.',
    icon: <ShoppingBagIcon className='w-15 h-15' />,
    href: '/services/ecommerce',
  },
  {
    title: 'CRM Apps',
    description:
      'Track leads, manage customer data, and boost engagement with smart tools that streamline sales and support workflows.',
    icon: <SwapIcon className='w-15 h-15 ' />,
    href: '/services/crm',
  },
  {
    title: 'Health Apps',
    description:
      'Empower users to monitor health, book appointments, and access care with secure, user-friendly medical tools and features.',
    icon: <HealthIcon className='w-15 h-15 ' />,
    href: '/services/health',
  },
  {
    title: 'Web Analytics Apps',
    description:
      'Gain real-time insights into website traffic, user behavior, and performance to optimize digital strategies and ROI.',
    icon: <ChartIcon className='w-15 h-15' />,
    href: '/services/analytics',
  },
  {
    title: 'Banking Apps',
    description:
      'Deliver secure, convenient financial services with features for transactions, account management, and fraud protection.',
    icon: <BankingIcon className='w-15 h-15' />,
    href: '/services/banking',
  },
];
