import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex items-center justify-between mb-4 mt-2 px-4">
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Header; 