
import React from 'react';
import { ThemeColor, UnitType } from '../types';
import { ChevronDown } from 'lucide-react';

interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  
  // Unit selection props
  unit?: UnitType;
  onUnitChange?: (unit: UnitType) => void;
  
  // Static suffix (fallback for fields like Price)
  suffix?: string;
  
  type?: "text" | "number";
  isCurrency?: boolean;
  theme: ThemeColor;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  unit,
  onUnitChange,
  suffix,
  type = "number",
  isCurrency = false,
  theme
}) => {
  // Map theme to specific focus colors
  const focusColorClass = {
    amber: "focus:ring-amber-500 focus:border-amber-500",
    blue: "focus:ring-blue-500 focus:border-blue-500",
    emerald: "focus:ring-emerald-500 focus:border-emerald-500",
    indigo: "focus:ring-indigo-500 focus:border-indigo-500",
    rose: "focus:ring-rose-500 focus:border-rose-500",
    slate: "focus:ring-slate-500 focus:border-slate-500",
  }[theme];

  const iconColorClass = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
    rose: "text-rose-600",
    slate: "text-slate-600",
  }[theme];

  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-bold text-gray-800 mb-2">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm group">
        {icon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isCurrency ? '' : iconColorClass} z-10`}>
            {icon}
          </div>
        )}
        <input
          type={type}
          name={id}
          id={id}
          className={`
            block w-full rounded-lg border-gray-300 bg-white
            focus:ring-2 ${focusColorClass}
            py-4 text-gray-900 placeholder-gray-400 
            text-xl font-semibold tracking-wide
            border
            ${icon ? 'pl-10' : 'pl-4'} 
            ${unit ? 'pr-24' : (suffix ? 'pr-20' : 'pr-4')}
            shadow-sm
            transition-all duration-200
          `}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
        />
        
        {/* Unit Selector or Static Suffix */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {onUnitChange && unit ? (
            <div className="h-full relative">
              <select
                value={unit}
                onChange={(e) => onUnitChange(e.target.value as UnitType)}
                className="h-full pl-3 pr-8 border-transparent bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 rounded-r-lg border-l border-gray-200 focus:ring-2 focus:ring-offset-0 focus:ring-gray-400 cursor-pointer appearance-none outline-none"
              >
                <option value="in">in (pulg)</option>
                <option value="ft">ft (pies)</option>
                <option value="m">m (metros)</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          ) : suffix ? (
            <span className="h-full flex items-center px-4 text-gray-600 font-bold text-lg bg-gray-100 border-l border-gray-200 rounded-r-lg">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
