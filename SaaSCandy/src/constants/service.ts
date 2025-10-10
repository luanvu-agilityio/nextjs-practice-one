import { Service } from '@/types';

export const services: Service[] = [
  {
    slug: 'edtech',
    title: 'EdTech Apps',
    subtitle:
      'Powerful tools that enhance learning experiences with interactive content, virtual classrooms, and performance tracking.',
    description:
      'Comprehensive educational technology solutions designed to transform modern learning environments.',
    whatItDoes: {
      title: 'What It Does',
      description:
        'Develop comprehensive EdTech applications designed to transform the learning experience for students and educators. These apps offer seamless integration of multimedia tools, course management systems, real-time communication features, and advanced assessment modules. The platform enables instructors to create personalized lesson plans and interactive quizzes, while students can track their progress and engage with educational materials in a dynamic, user-friendly interface. Features such as video and audio integration, real-time feedback, and gamified learning make these apps ideal for modern classrooms and online learning environments.',
      image: '/images/services/edtech-illustration.png',
    },
    features: [
      {
        id: 'course-management',
        title: 'Course Management System',
        description:
          'Manage courses with multimedia support, helping both students and instructors organize and engage in learning materials.',
      },
      {
        id: 'student-progress',
        title: 'Student Profiles & Progress Tracking',
        description:
          "Track and manage students' progress with personalized learning paths, enabling educators to provide targeted support.",
      },
      {
        id: 'interactive-quizzes',
        title: 'Interactive Quizzes & Exams',
        description:
          'Create and grade interactive quizzes and exams, providing real-time feedback to students.',
      },
      {
        id: 'video-audio',
        title: 'Video & Audio Integration',
        description:
          'Incorporate multimedia elements like videos and audio for enhanced learning experiences.',
      },
      {
        id: 'real-time-chat',
        title: 'Real-Time Chat',
        description:
          'Enable instant communication between students and instructors for better engagement.',
      },
    ],
    icon: 'BookOpen',
  },
  {
    slug: 'ecommerce',
    title: 'eCommerce Apps',
    subtitle:
      'Seamlessly manage online stores, process payments, and optimize customer experiences to drive sales and conversions.',
    description: 'Complete eCommerce solutions for modern online businesses.',
    whatItDoes: {
      title: 'What It Does',
      description:
        'Build powerful eCommerce applications that streamline online business operations. Our platform provides comprehensive tools for inventory management, payment processing, customer relationship management, and analytics. Features include multi-payment gateway integration, real-time inventory tracking, personalized shopping experiences, and advanced reporting dashboards.',
      image: '/images/services/ecommerce-illustration.png',
    },
    features: [
      {
        id: 'inventory-management',
        title: 'Inventory Management',
        description:
          'Real-time inventory tracking and management with automated alerts and restocking suggestions.',
      },
      {
        id: 'payment-processing',
        title: 'Payment Processing',
        description:
          'Secure multi-gateway payment processing with support for major payment methods.',
      },
      {
        id: 'customer-analytics',
        title: 'Customer Analytics',
        description:
          'Detailed customer behavior analytics and personalized recommendation engines.',
      },
      {
        id: 'order-management',
        title: 'Order Management',
        description:
          'Comprehensive order tracking and fulfillment management system.',
      },
      {
        id: 'mobile-optimization',
        title: 'Mobile Optimization',
        description:
          'Fully responsive design optimized for mobile shopping experiences.',
      },
    ],
    icon: 'ShoppingCart',
  },
  {
    slug: 'crm',
    title: 'CRM Apps',
    subtitle:
      'Track leads, manage customer data, and boost engagement with smart tools that streamline sales and support workflows.',
    description: 'Advanced customer relationship management solutions.',
    whatItDoes: {
      title: 'What It Does',
      description:
        'Develop comprehensive CRM applications that help businesses manage customer relationships effectively. Our platform includes lead tracking, customer data management, sales pipeline automation, and communication tools. Features include contact management, deal tracking, email integration, and advanced reporting capabilities.',
      image: '/images/services/crm-illustration.png',
    },
    features: [
      {
        id: 'lead-tracking',
        title: 'Lead Tracking',
        description:
          'Advanced lead capture, scoring, and nurturing capabilities with automated workflows.',
      },
      {
        id: 'contact-management',
        title: 'Contact Management',
        description:
          'Centralized customer database with detailed interaction history and preferences.',
      },
      {
        id: 'sales-pipeline',
        title: 'Sales Pipeline',
        description:
          'Visual sales pipeline management with customizable stages and automation.',
      },
      {
        id: 'email-integration',
        title: 'Email Integration',
        description:
          'Seamless email integration with tracking and automated follow-up sequences.',
      },
      {
        id: 'reporting-analytics',
        title: 'Reporting & Analytics',
        description:
          'Comprehensive reporting and analytics for sales performance and customer insights.',
      },
    ],
    icon: 'Users',
  },
  // Add other services (health, analytics, banking) following the same pattern
];
