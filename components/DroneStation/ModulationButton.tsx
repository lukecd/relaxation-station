import React from 'react';

interface ModulationButtonProps {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  title: string;
  icon?: React.ReactNode;
}

export const ModulationButton = ({ 
  label, 
  color,
  active,
  onClick,
  title,
  icon
}: ModulationButtonProps) => (
  <button
    className={`
      px-2 py-1 md:px-4 md:py-2 rounded-full transition-all duration-300 
      flex items-center gap-2 text-sm md:text-base
      ${active ? 'bg-opacity-100 shadow-lg scale-105' : 'bg-opacity-75 hover:bg-opacity-90'}
      ${color}
    `}
    onClick={onClick}
    title={title}
  >
    {icon}
    {label}
  </button>
);

export default ModulationButton; 