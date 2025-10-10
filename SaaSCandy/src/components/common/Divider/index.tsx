interface DividerProps {
  text?: string;
  className?: string;
}

function Divider({ text = 'OR', className = '' }: Readonly<DividerProps>) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className='absolute inset-0 flex items-center'>
        <div className='w-full border-t border-gray-200' />
      </div>
      <div className='relative bg-white px-4'>
        <span className='text-sm text-gray-500 font-medium'>{text}</span>
      </div>
    </div>
  );
}
export { Divider };
