import React from 'react';
import { CalculationResult, ThemeColor } from '../types';
import { Package, Box, Coins } from 'lucide-react';

interface ResultCardProps {
  result: CalculationResult | null;
  theme: ThemeColor;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, theme }) => {
  if (!result) return null;

  const themeStyles = {
    amber: { border: 'border-amber-100', header: 'from-amber-50 to-orange-50', text: 'text-amber-900', subBorder: 'border-amber-200' },
    blue: { border: 'border-blue-100', header: 'from-blue-50 to-sky-50', text: 'text-blue-900', subBorder: 'border-blue-200' },
    emerald: { border: 'border-emerald-100', header: 'from-emerald-50 to-green-50', text: 'text-emerald-900', subBorder: 'border-emerald-200' },
    indigo: { border: 'border-indigo-100', header: 'from-indigo-50 to-violet-50', text: 'text-indigo-900', subBorder: 'border-indigo-200' },
    rose: { border: 'border-rose-100', header: 'from-rose-50 to-pink-50', text: 'text-rose-900', subBorder: 'border-rose-200' },
    slate: { border: 'border-slate-100', header: 'from-slate-50 to-gray-50', text: 'text-slate-900', subBorder: 'border-slate-200' },
  }[theme];

  return (
    <div className={`mt-6 bg-white overflow-hidden shadow rounded-lg border ${themeStyles.border} animate-fade-in-up`}>
      <div className={`px-4 py-5 sm:p-6 bg-gradient-to-r ${themeStyles.header}`}>
        <h3 className={`text-lg leading-6 font-medium ${themeStyles.text} border-b ${themeStyles.subBorder} pb-2 mb-4`}>
          Resultados del Cálculo
        </h3>
        
        <div className="grid grid-cols-1 gap-5">
          {/* Board Feet Result */}
          <div className="relative bg-white pt-5 px-4 pb-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border-l-4 border-amber-500">
            <dt>
              <div className="absolute bg-amber-500 rounded-md p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Pies Tabla (BF)</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-3xl font-bold text-gray-900">
                {result.boardFeet.toFixed(2)} <span className="text-lg text-gray-600 font-bold ml-1">BF</span>
              </p>
            </dd>
          </div>

          {/* Cubic Meters Result */}
          <div className="relative bg-white pt-5 px-4 pb-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border-l-4 border-blue-500">
            <dt>
              <div className="absolute bg-blue-500 rounded-md p-3">
                <Box className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Metros Cúbicos (m³)</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-3xl font-bold text-gray-900">
                {result.cubicMeters.toFixed(6)} <span className="text-lg text-gray-600 font-bold ml-1">m³</span>
              </p>
            </dd>
          </div>

          {/* Total Cost Result */}
          <div className="relative bg-white pt-5 px-4 pb-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border-l-4 border-green-500">
            <dt>
              <div className="absolute bg-green-500 rounded-md p-3">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">Costo Total</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-3xl font-bold text-gray-900">
                <span className="text-lg text-gray-600 font-bold mr-1">S/.</span>{result.totalCost.toFixed(2)}
              </p>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};