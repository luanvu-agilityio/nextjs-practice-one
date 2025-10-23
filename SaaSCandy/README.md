# NextJs Practice One

## Overview

Welcome to my Next.js Practice Project - a modern web application built with Next.js 15 and TypeScript, featuring secure authentication, comprehensive form validation, and dynamic user management. This project demonstrates the implementation of Next.js features including App Router, Server Actions, and advanced authentication patterns with Better Auth.

Key Features:

1. Advanced Authentication System

- Multi-provider authentication (GitHub, Google OAuth)
- Traditional email/password credentials
- Two-Factor Authentication (2FA) via email using Better Auth
- Secure session management and middleware protection
- Protected routes with authorization checks
- Seamless logout functionality

2. Form Validation & Handling

- Comprehensive form validation using React Hook Form
- Schema validation with Zod
- Server-side validation with Next.js Server Actions
- Real-time error feedback and user-friendly messages

3. User Profile Management

- Update personal information
- Secure password change functionality

4. Modern UI/UX

- Responsive design for all devices
- Loading states with Suspense and streaming
- Skeleton loaders for enhanced user experience
- Intuitive navigation system
- Smooth page transitions


5. Performance Optimized

- Server-side rendering (SSR) and Static Site Generation (SSG)
- Image optimization with Next.js Image component
- Code splitting and lazy loading

This project showcases practical applications of Next.js 15 with TypeScript, demonstrating modern web development practices, secure authentication flows, and production-ready patterns essential for building scalable web applications.

## Timeline

- Estimation time: 
    - Phase one: 2nd Oct, 2025 - 9th Oct, 2025
    - Phase two: 10th Oct, 2025 - 20th Oct, 2025

## Team size

- 1 Dev ([Luan Vu](luan.vu@asnet.com.vn))

## Technical terms

- REACT v19

- TYPESCRIPT

- BETTER AUTH

- NEON POSTGRES

- REACT HOOK FORM

- ZOD

- TANSTACK QUERY

- JEST

- REACT TESTING LIBRARY
  
- SHADCN

- TAILWINDCSS

## Target

- Practically, file conventions and some knowledge of data fetching, rendering, caching and optimization should be applied in improvement scenarios.
- Some outstanding hooks/directives/features which the trainees can concentrate on:
- Hooks:
    - useSearchParams
    - usePathname
    - userRouter
    - useFormStatus
    - useFormState
- Directives:
    - ‘use server’
    - ‘use client’
- Features:
- The notFound function and not-found file
- Revalidate the client cache

## Prerequisite

- Visual Studio Code version [1.105.1]

- Node.js [v22.19.0]

- TypeScript version [5.9.3]
  
- React [19.0.0]

- NextJs [15.5.4]
  
- Better Auth [1.3.27]
  
- Drizzle ORM [0.44.6]

- Neon database/ serverless [1.0.2]
  
- Storybook [9.1.10]

- React Hook Form [7.65.0]

- Zod [4.1.12]

- Tanstack query [5.90.3]

- Resend [6.1.3]
  
- Jest [30.2.0]
  
- ESlint version[9.37.0]

- Prettier version [3.6.2]

- Lucide react [0.542.0]

- TailwindCSS [3.4.18]

- Extensions: editorconfig, Prettier, ESlint

## Folder's structure

```
|- .husky/
|- .next/
|- .storybook/
|- documents/
|- drizzle
|- node_modules
|- public
|- src/
    |- api/
        |- auth.ts
        |- blog-post.ts
    |- app/
    |- component/
        |- common/
        |- layout/
        |- ...
    |- constants/
    |- helpers/
    |- hooks/
    |- lib/
    |- providers/
    |- services/   
    |- types/
    |- utils/
|- .editorconfig
|- .eslintignore
|- .eslintrc.json
|- .linstagedrc.json
|- .prettierignore
|- .prettierrc
|- commit-lint-config.js
|- component.json
|- drizzle.config.ts
|- eslint.config.mjs
|- jest.config.ts
|- jest.setup.ts
|- next-config.ts
|- package.json
|- pnpm-lock.yaml
|- README.md
|- tailwind.config.ts
|- tsconfig.json
|- vercel.json


```

## Step by step to run this app in your local

| Command                                                          | Action                           |
| ---------------------------------------------------------------- | -------------------------------- |
| git clone git@gitlab.asoft-python.com:luan.vu/react-training.git | Download the source code         |
| git checkout feat/practice-one                                   | Checkout to branch feat/practice |
| cd SaaSCandy                                                     | Move to folder                   |
| pnpm install                                                     | Install dependencies             |
| pnpm build                                                       | Build the application            |
| pnpm start                                                       | Start the application            |
| Open new terminal for story book                                 |                                  |
| pnpm run storybook                                               | Run storybook                    |
| Implement unit test                                              |                                  |
| pnpm run test:coverage                                           | Run the unit test                |
| Manage database with Neon Postgres and Drizzle ORM               |                                  |
| pnpm db:generate                                                 | Generate the drizzle kit         |
| pnpm db:migrate                                                  | Migrate the drizzle kit          |
| pnpm db:studio                                                   | Init Studio to observe database  |
**Notes:**

- See the deployment link on Vercel at the end of this document for more details

## Contributing

I welcome any and all contribution! If you have found or encountered any bugs or issues, please let me know. Any recommendation is also welcomed.

## Helpful links

[Figma](https://www.figma.com/design/jAMYMPEjakenbCuIHkIij0/SaaSCandy-Free-Nextjs-Website-Template--Community-?node-id=47-2526&t=vo7kx64N17CMkN0w-0)

[My training plan](https://docs.google.com/document/d/1GccfxktPHPNjPFA6FGH95OSfKqM_HZ58_8MJKsXojbk/edit?pli=1&tab=t.0)

[Practice plan](https://docs.google.com/document/d/1GccfxktPHPNjPFA6FGH95OSfKqM_HZ58_8MJKsXojbk/edit?pli=1&tab=t.x88nm1ctxgyi#heading=h.j35h9y6mps89)

[Deployment link](https://nextjs-practice-one-luanvu.vercel.app/)

###

Special thanks to my mentor Mr. Minh Tran, my supporter Mr. Thinh Nguyen and Mr. Tuan Thai who provide me all the useful help and support throughout my training session. It is my pleasure to work with you guys!

