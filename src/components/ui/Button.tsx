import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'outline' | 'primary' | 'icon';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Button({ variant = 'dark', size = 'md', icon, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-main font-medium cursor-pointer transition-all duration-300';
  const variants = {
    dark: 'bg-accent text-white border-none rounded-sm hover:brightness-110 hover:-translate-y-px uppercase tracking-wider text-[13px]',
    outline: 'bg-transparent text-black border border-gray-300 rounded-sm hover:border-black text-[13px]',
    primary: 'w-full bg-white text-black border-none rounded-sm font-semibold uppercase tracking-widest text-sm hover:-translate-y-px hover:shadow-lg',
    icon: 'w-9 h-9 bg-transparent border border-gray-200 rounded-sm text-gray-500 hover:border-gray-400 hover:text-black',
  };
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: variant === 'icon' ? '' : 'px-6 py-3',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}
