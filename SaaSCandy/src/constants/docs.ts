export const docsCategories = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Quick Start Guide', href: '#quick-start' },
      { title: 'Installation', href: '#installation' },
      { title: 'Configuration', href: '#configuration' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Authentication', href: '#auth' },
      { title: 'Endpoints', href: '#endpoints' },
      { title: 'Rate Limits', href: '#limits' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { title: 'Webhooks', href: '#webhooks' },
      { title: 'Third Party APIs', href: '#third-party' },
      { title: 'SDK Usage', href: '#sdk' },
    ],
  },
];

export const sampleContent = {
  'quick-start': {
    title: 'Quick Start Guide',
    content: `
      Welcome to SaaSCandy! This guide will help you get started with our platform in just a few minutes.

      ## Step 1: Create Your Account
      Sign up for a free account to get started with SaaSCandy.

      ## Step 2: Set Up Your First Project
      Once logged in, create your first project and configure the basic settings.

      ## Step 3: Integrate Your Apps
      Use our simple API to connect your existing applications.
    `,
  },
  installation: {
    title: 'Installation',
    content: `
      ## NPM Installation
      \`\`\`bash
      npm install @saascandy/sdk
      \`\`\`

      ## Yarn Installation
      \`\`\`bash
      yarn add @saascandy/sdk
      \`\`\`

      ## CDN Usage
      \`\`\`html
      <script src="https://cdn.saascandy.com/sdk/v1.0.0/saascandy.min.js"></script>
      \`\`\`
    `,
  },
};
