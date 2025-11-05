export interface PrivacySection {
  id: string;
  title: string;
  paragraphs?: string[];
  listItems?: string[];
  ordered?: boolean;
}

export interface PrivacyContent {
  updated: string;
  contactEmail: string;
  sections: PrivacySection[];
}

export const privacyContent: PrivacyContent = {
  updated: 'November 4, 2025',
  contactEmail: 'privacy@saascandy.example',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'SaaSCandy respects your privacy. This Privacy Policy explains what information we collect, why we collect it, and how you can manage your information. By using our services you agree to the collection and use of information in accordance with this policy.',
      ],
    },
    {
      id: 'information',
      title: 'Information We Collect',
      listItems: [
        'Personal information: name, email address, profile and account details you provide when you sign up.',
        'Usage data: pages visited, features used, timestamps and diagnostic data collected automatically to help us improve the product.',
        'Third-party data: data returned by services you connect (for example, OAuth providers) when you choose to link an account.',
      ],
    },
    {
      id: 'use',
      title: 'How We Use Your Information',
      listItems: [
        'To provide and maintain the service.',
        'To communicate with you about your account and updates.',
        'To monitor and analyze usage to improve performance.',
        'To protect against fraud, abuse and security incidents.',
      ],
      ordered: true,
    },
    {
      id: 'retention',
      title: 'Data Retention',
      paragraphs: [
        'We retain personal data only as long as necessary for the purposes set out in this policy, or as required by law. When data is no longer necessary we will securely delete or anonymize it.',
      ],
    },
    {
      id: 'third-party',
      title: 'Third-party Services & Cookies',
      paragraphs: [
        'We use third-party services to power parts of the product (email, analytics, payments). Those services have their own privacy policies — links are provided below where applicable.',
      ],
      listItems: [
        'Analytics: we use analytics to understand usage and improve the product. You can opt out through your browser or account settings where available.',
        'Payments: payments are processed by PCI-compliant providers and we do not store full payment card numbers on our systems.',
      ],
    },
    {
      id: 'security',
      title: 'Security',
      paragraphs: [
        'We implement reasonable administrative, technical and physical safeguards to protect your information. However, no method of transmission over the internet or electronic storage is completely secure — please use strong, unique passwords and two-factor authentication where supported.',
      ],
    },
    {
      id: 'choices',
      title: 'Your Choices & Rights',
      listItems: [
        'Access & Correction: you can access and update your account information via your account settings.',
        'Deletion: you may request that we delete your account and personal data — contact us using the address below.',
        'Marketing: you can opt out of marketing emails via the unsubscribe link in the message or in account settings.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'If you have questions, requests, or concerns about this policy, please contact us using the email address provided below.',
      ],
    },
  ],
};
