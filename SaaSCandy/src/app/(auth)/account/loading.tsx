import { Skeleton } from '@/components/ui';

const AccountLoading = () => {
  return (
    <div className='flex flex-col items-center max-w-[1296px] mx-auto min-h-screen py-8'>
      {/* Header Loading */}
      <div className='pb-12 w-full'>
        <div className='flex justify-center mb-4'>
          <Skeleton className='h-10 w-48' />
        </div>

        {/* Breadcrumb Loading */}
        <div className='flex justify-center gap-2'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-4 w-2' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>

      {/* Account Card Loading */}
      <div className='py-14 px-16 w-full max-w-159 rounded-4xl border border-form-border-color shadow-form bg-white animate-pulse'>
        <div className='flex flex-col gap-10'>
          {/* Logo Loading */}
          <div className='flex justify-center'>
            <Skeleton className='h-10 w-48' />
          </div>

          {/* User Information Loading */}
          <div className='space-y-8'>
            {/* Profile Header Loading */}
            <div className='text-center space-y-4'>
              {/* Avatar Loading */}
              <div className='flex justify-center'>
                <Skeleton className='w-24 h-24 rounded-full' />
              </div>

              {/* Name and Email Loading */}
              <div className='space-y-2'>
                <Skeleton className='h-6 w-32 mx-auto' />
                <Skeleton className='h-4 w-48 mx-auto' />
              </div>
            </div>

            {/* Information Cards Loading */}
            <div className='space-y-4'>
              {/* Personal Information Card */}
              <div className='bg-blue-foreground opacity-80 rounded-lg p-6'>
                <Skeleton className='h-6 w-40 mb-4' />
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <Skeleton className='h-5 w-12' />
                    <Skeleton className='h-5 w-32' />
                  </div>
                  <div className='flex justify-between items-center'>
                    <Skeleton className='h-5 w-12' />
                    <Skeleton className='h-5 w-48' />
                  </div>
                  <div className='flex justify-between items-center'>
                    <Skeleton className='h-5 w-24' />
                    <Skeleton className='h-6 w-28 rounded-full' />
                  </div>
                </div>
              </div>

              {/* Account Settings Card */}
              <div className='bg-blue-foreground opacity-80 rounded-lg p-6'>
                <Skeleton className='h-6 w-32 mb-4' />
                <div className='space-y-3'>
                  <Skeleton className='h-12 w-full rounded-lg' />
                  <Skeleton className='h-12 w-full rounded-lg' />
                  <Skeleton className='h-12 w-full rounded-lg' />
                </div>
              </div>
            </div>

            {/* Action Buttons Loading */}
            <div className='flex gap-4 pt-6'>
              <Skeleton className='h-12 flex-1 rounded-lg' />
              <Skeleton className='h-12 flex-1 rounded-lg' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountLoading;
