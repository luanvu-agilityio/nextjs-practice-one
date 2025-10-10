import { JSX } from 'react';

function AuthSectionSkeleton(): JSX.Element {
  return (
    <div className='hidden sm:flex items-center gap-4'>
      {/* Loading skeleton */}
      <div className='w-20 h-8 bg-gray-200 rounded animate-pulse'></div>
      <div className='w-20 h-8 bg-gray-200 rounded animate-pulse'></div>
    </div>
  );
}
export default AuthSectionSkeleton;
