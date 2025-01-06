interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-12 h-12" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="16" cy="16" r="15" fill="#1d4f91"/>
      
      {/* Momo shape */}
      <path d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16Z" fill="white"/>
      
      {/* Pleats */}
      <path d="M16 8C16 8 16 16 16 16M12 9.5C12 9.5 16 16 16 16M20 9.5C20 9.5 16 16 16 16M10 12C10 12 16 16 16 16M22 12C22 12 16 16 16 16" stroke="#1d4f91" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Steam */}
      <path d="M14 6C14 6 13 4 14 3M16 5C16 5 16 3 16 2M18 6C18 6 19 4 18 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
} 