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

  // New services added: Health, Analytics, Banking
  {
    slug: 'health',
    title: 'Health Apps',
    subtitle:
      'Enable users to monitor health, book appointments, and access care with secure and user-friendly medical tools.',
    description:
      'Patient-centric healthcare solutions for modern clinics and telemedicine platforms.',
    whatItDoes: {
      title: 'What It Does',
      description:
        'Build secure health applications that provide appointment booking, teleconsultations, health records, prescription management, and analytics for clinicians. The platform supports HIPAA-compliant data handling, patient portals, and real-time notifications to improve patient engagement and clinical workflows.',
      image: '/images/services/health-illustration.png',
    },
    features: [
      {
        id: 'appointment-booking',
        title: 'Appointment Booking',
        description:
          'Simple and efficient scheduling with calendar integration and reminders.',
      },
      {
        id: 'telemedicine',
        title: 'Telemedicine & Video Consults',
        description:
          'Secure video visits and chat for remote patient care and follow-ups.',
      },
      {
        id: 'emr-integration',
        title: 'EHR/EMR Integration',
        description:
          'Integrate with electronic medical records for unified patient histories.',
      },
      {
        id: 'secure-data',
        title: 'Secure Patient Data',
        description:
          'Encrypted storage and role-based access controls to protect PHI.',
      },
      {
        id: 'analytics-dashboard',
        title: 'Health Analytics',
        description:
          'Insights and reporting to track outcomes, appointments, and population health metrics.',
      },
    ],
    icon: 'Health',
  },

  {
    slug: 'analytics',
    title: 'Web Analytics Apps',
    subtitle:
      'Gain real-time insights into website traffic, user behavior, and performance to optimize digital strategies and ROI.',
    description:
      'Powerful analytics platforms to collect, visualize, and act on user data.',
    whatItDoes: {
      title: 'What It Does',
      description:
        'Create analytics dashboards that aggregate events, funnels, sessions, and conversion metrics. Provide segmentation, real-time monitoring, and alerting to help teams optimize product experience and marketing campaigns. Includes integrations with common data warehouses and reporting tools.',
      image: '/images/services/analytics-illustration.png',
    },
    features: [
      {
        id: 'real-time-tracking',
        title: 'Real-time Tracking',
        description: 'Monitor user activity and traffic spikes as they happen.',
      },
      {
        id: 'funnel-analysis',
        title: 'Funnel & Cohort Analysis',
        description:
          'Analyze conversion funnels and user cohorts to identify drop-offs.',
      },
      {
        id: 'custom-dashboards',
        title: 'Custom Dashboards',
        description: 'Build visual dashboards with charts, tables, and KPIs.',
      },
      {
        id: 'data-exports',
        title: 'Data Export & Integrations',
        description:
          'Export raw data to warehouses or connect to BI tools for deeper analysis.',
      },
      {
        id: 'alerts',
        title: 'Alerts & Anomaly Detection',
        description:
          'Automatic alerts for traffic anomalies, errors, and KPI regressions.',
      },
    ],
    icon: 'Chart',
  },

  {
    slug: 'banking',
    title: 'Banking Apps',
    subtitle:
      'Deliver secure, convenient financial services with features for transactions, account management, and fraud protection.',
    description:
      'Robust banking and fintech solutions for modern financial products.',
    whatItDoes: {
      title: 'What It Does',
      description:
        'Build compliant banking applications for account management, payments, transfers, card issuance, and fraud detection. Provide secure onboarding, KYC workflows, and real-time transaction processing with integrations to core banking APIs and payment gateways.',
      image: '/images/services/banking-illustration.png',
    },
    features: [
      {
        id: 'account-management',
        title: 'Account Management',
        description:
          'User accounts, balances, statements, and secure authentication.',
      },
      {
        id: 'payments',
        title: 'Payments & Transfers',
        description: 'Support for ACH, card payments, and real-time transfers.',
      },
      {
        id: 'card-issuing',
        title: 'Card Issuing & Management',
        description: 'Virtual and physical card issuance with spend controls.',
      },
      {
        id: 'fraud-detection',
        title: 'Fraud Detection',
        description: 'Real-time monitoring and rules-based fraud prevention.',
      },
      {
        id: 'compliance',
        title: 'Compliance & KYC',
        description:
          'Built-in KYC/AML workflows and reporting for regulatory compliance.',
      },
    ],
    icon: 'Banking',
  },
];
