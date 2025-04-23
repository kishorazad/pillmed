import { SVGProps } from 'react';

const FemaleIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="7" />
      <path d="M12 15v7" />
      <path d="M9 18h6" />
    </svg>
  );
};

export default FemaleIcon;