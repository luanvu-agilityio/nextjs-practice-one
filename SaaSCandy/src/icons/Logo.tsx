const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='32'
    height='32'
    viewBox='0 0 32 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <circle cx='15.9999' cy='15.9999' r='15.9999' fill='#FFD245' />
    <mask
      id='mask0_2053_384'
      style={{ maskType: 'alpha' }}
      maskUnits='userSpaceOnUse'
      x='0'
      y='0'
      width='32'
      height='32'
    >
      <circle cx='15.9999' cy='15.9999' r='15.9999' fill='#FFD245' />
    </mask>
    <g mask='url(#mask0_2053_384)'>
      <circle cx='19.3045' cy='9.53418' r='15.9999' fill='#FFE486' />
      <circle cx='28.3808' cy='9.53418' r='15.9999' fill='#EE7B11' />
    </g>
    <circle
      cx='24.7011'
      cy='24.7013'
      r='6.29869'
      fill='#1642B9'
      stroke='white'
      strokeWidth='2'
    />
  </svg>
);
export { LogoIcon };
