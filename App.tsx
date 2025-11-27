
import React, { useState, useCallback, useEffect } from 'react';
import { Ruler, Coins, Calculator, AlertCircle, Layers, ScanLine, Plus, Palette, Download } from 'lucide-react';
import { Input } from './components/Input';
import { ResultCard } from './components/ResultCard';
import { BudgetList } from './components/BudgetList';
import { CalculationResult, WoodDimensions, BudgetItem, ThemeColor, UnitType } from './types';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<ThemeColor>('amber');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as ThemeColor;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Save theme and update meta color when it changes
  useEffect(() => {
    localStorage.setItem('app_theme', theme);

    // Update Android status bar color
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      const colorMap: Record<ThemeColor, string> = {
        amber: '#d97706',
        blue: '#2563eb',
        emerald: '#059669',
        indigo: '#4f46e5',
        rose: '#e11d48',
        slate: '#475569'
      };
      metaThemeColor.setAttribute("content", colorMap[theme]);
    }
  }, [theme]);

  // State for inputs with separate units
  const [dimensions, setDimensions] = useState<WoodDimensions>({
    length: '',
    lengthUnit: 'in',
    width: '',
    widthUnit: 'in',
    thickness: '',
    thicknessUnit: 'in',
    price: ''
  });

  // State for results, errors, and the budget list
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  // Handlers for input changes
  const handleValueChange = (key: keyof WoodDimensions, value: string) => {
    // Only allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDimensions(prev => ({ ...prev, [key]: value }));
      if (error) setError(null);
    }
  };

  const handleUnitChange = (key: 'lengthUnit' | 'widthUnit' | 'thicknessUnit', unit: UnitType) => {
    setDimensions(prev => ({ ...prev, [key]: unit }));
    // Optional: Recalculate automatically if valid? For now, let user click Calculate
    if (result) setResult(null); // Clear result to indicate data changed
  };

  // Helper: Convert any unit to Inches
  const toInches = (value: number, unit: UnitType): number => {
    switch (unit) {
      case 'in': return value;
      case 'ft': return value * 12;
      case 'm': return value * 39.3701;
      case 'cm': return value * 0.393701;
      case 'mm': return value * 0.0393701;
      default: return value;
    }
  };

  // Helper to validate inputs and get values in INCHES
  const validateAndConvert = (): { l: number, w: number, t: number, p: number } | null => {
    const { length, lengthUnit, width, widthUnit, thickness, thicknessUnit, price } = dimensions;

    const rawL = parseFloat(length);
    const rawW = parseFloat(width);
    const rawT = parseFloat(thickness);
    const p = parseFloat(price);

    if (isNaN(rawL) || isNaN(rawW) || isNaN(rawT) || isNaN(p) || rawL <= 0 || rawW <= 0 || rawT <= 0 || p < 0) {
      setError("Por favor, ingresa valores numéricos válidos en todos los campos");
      setResult(null);
      setTimeout(() => setError(null), 3000);
      return null;
    }

    // Convert all to inches for the standard BF formula
    const l = toInches(rawL, lengthUnit);
    const w = toInches(rawW, widthUnit);
    const t = toInches(rawT, thicknessUnit);

    return { l, w, t, p };
  };

  // Calculation Logic
  const performCalculation = (vals: { l: number, w: number, t: number, p: number }): CalculationResult => {
    // 1. Calculate Board Feet (BF) -> Formula: (L_in * W_in * T_in) / 144
    const volumeInches = vals.l * vals.w * vals.t;
    const boardFeet = volumeInches / 144;

    // 2. Calculate Cubic Meters (m3) -> 1 BF = 0.00235974 m3
    const cubicMeters = boardFeet * 0.00235974;

    // 3. Calculate Total Cost
    const totalCost = boardFeet * vals.p;

    return { boardFeet, cubicMeters, totalCost };
  };

  // Handler: Just Calculate (Preview)
  const calculate = useCallback(() => {
    const vals = validateAndConvert();
    if (!vals) return;

    const calcResult = performCalculation(vals);
    setResult(calcResult);
    setError(null);
  }, [dimensions]);

  // Handler: Add to Budget List
  const addToBudget = useCallback(() => {
    const vals = validateAndConvert();
    if (!vals) return;

    const calcResult = performCalculation(vals);

    // Update preview result
    setResult(calcResult);
    setError(null);

    // Add to list
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      dimensions: { ...dimensions }, // Save the original user input (values + units)
      result: calcResult,
      timestamp: Date.now()
    };

    setBudgetItems(prev => [...prev, newItem]);
  }, [dimensions]);

  // Handler: Remove from Budget List
  const removeFromBudget = (id: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setDimensions({
      length: '', lengthUnit: 'in',
      width: '', widthUnit: 'in',
      thickness: '', thicknessUnit: 'in',
      price: ''
    });
    setResult(null);
    setError(null);
  };

  // Dynamic Theme Classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'blue':
        return {
          iconBg: 'bg-blue-600',
          gradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
          outlineBtn: 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100',
          sectionBg: 'bg-blue-50/50 border-blue-100',
          sectionText: 'text-blue-800'
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-600',
          gradient: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
          outlineBtn: 'border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
          sectionBg: 'bg-emerald-50/50 border-emerald-100',
          sectionText: 'text-emerald-800'
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-600',
          gradient: 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
          outlineBtn: 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
          sectionBg: 'bg-indigo-50/50 border-indigo-100',
          sectionText: 'text-indigo-800'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-600',
          gradient: 'from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800',
          outlineBtn: 'border-rose-500 text-rose-700 bg-rose-50 hover:bg-rose-100',
          sectionBg: 'bg-rose-50/50 border-rose-100',
          sectionText: 'text-rose-800'
        };
      case 'slate':
        return {
          iconBg: 'bg-slate-600',
          gradient: 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
          outlineBtn: 'border-slate-500 text-slate-700 bg-slate-50 hover:bg-slate-100',
          sectionBg: 'bg-slate-50/50 border-slate-100',
          sectionText: 'text-slate-800'
        };
      default: // amber
        return {
          iconBg: 'bg-amber-600',
          gradient: 'from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800',
          outlineBtn: 'border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100',
          sectionBg: 'bg-amber-50/50 border-amber-100',
          sectionText: 'text-amber-800'
        };
    }
  };

  const t = getThemeClasses();

  const ColorButton = ({ color, active }: { color: ThemeColor, active: boolean }) => {
    const bgColors = {
      amber: 'bg-amber-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-500',
      rose: 'bg-rose-500',
      slate: 'bg-slate-500'
    };

    return (
      <button
        type="button"
        onClick={() => setTheme(color)}
        className={`w-6 h-6 rounded-full ${bgColors[color]} ${active ? 'ring-2 ring-offset-2 ring-gray-400' : ''} transition-all`}
        aria-label={`Select ${color} theme`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="max-w-md w-full space-y-6">

        {/* Header Section with Theme Switcher */}
        <div className="flex flex-col items-center relative mb-6">
          <div className="absolute top-0 right-0 flex space-x-1">
            <ColorButton color="amber" active={theme === 'amber'} />
            <ColorButton color="emerald" active={theme === 'emerald'} />
            <ColorButton color="blue" active={theme === 'blue'} />
            <ColorButton color="indigo" active={theme === 'indigo'} />
            <ColorButton color="rose" active={theme === 'rose'} />
            <ColorButton color="slate" active={theme === 'slate'} />
          </div>

          <div className={`mt-6 mx-auto h-14 w-14 ${t.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-colors duration-300`}>
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight text-center">
            Calculadora de Madera
          </h2>
          <p className="mt-1 text-sm text-gray-600 text-center">
            Pies Tabla y Costos (Soles)
          </p>

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className={`mx-auto flex items-center px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-md hover:bg-gray-800 transition-all animate-bounce`}
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar App
            </button>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white py-6 px-4 shadow-xl rounded-2xl sm:px-8 border border-gray-100 transition-all duration-300">

          {/* Error Toast */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); calculate(); }}>

            {/* Dimensions Section */}
            <div className={`p-5 rounded-xl border mb-6 transition-colors duration-300 ${t.sectionBg}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center ${t.sectionText}`}>
                <Ruler className="w-4 h-4 mr-2" /> Dimensiones
              </h3>

              <Input
                id="length"
                label="Longitud"
                value={dimensions.length}
                onChange={(val) => handleValueChange('length', val)}
                placeholder="0"
                unit={dimensions.lengthUnit}
                onUnitChange={(u) => handleUnitChange('lengthUnit', u)}
                icon={<Ruler className="h-5 w-5" />}
                theme={theme}
              />

              <Input
                id="width"
                label="Ancho"
                value={dimensions.width}
                onChange={(val) => handleValueChange('width', val)}
                placeholder="0"
                unit={dimensions.widthUnit}
                onUnitChange={(u) => handleUnitChange('widthUnit', u)}
                icon={<ScanLine className="h-5 w-5" />}
                theme={theme}
              />

              <Input
                id="thickness"
                label="Grosor"
                value={dimensions.thickness}
                onChange={(val) => handleValueChange('thickness', val)}
                placeholder="0"
                unit={dimensions.thicknessUnit}
                onUnitChange={(u) => handleUnitChange('thicknessUnit', u)}
                icon={<Layers className="h-5 w-5" />}
                theme={theme}
              />
            </div>

            {/* Price Section */}
            <div className="bg-green-50/50 p-5 rounded-xl border border-green-100 mb-6">
              <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-4 flex items-center">
                <Coins className="w-4 h-4 mr-2" /> Precio
              </h3>
              <Input
                id="price"
                label="Precio por Pie Tabla (S/.)"
                value={dimensions.price}
                onChange={(val) => handleValueChange('price', val)}
                placeholder="0.00"
                suffix="/ BF"
                icon={<span className="text-green-600 font-bold text-sm">S/.</span>}
                isCurrency
                theme={theme}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className={`flex-[2] py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r ${t.gradient} focus:outline-none transition-all duration-200 transform active:scale-[0.98]`}
                >
                  CALCULAR
                </button>
              </div>

              <button
                type="button"
                onClick={addToBudget}
                className={`w-full py-3 px-4 border-2 border-dashed rounded-xl shadow-sm text-base font-bold focus:outline-none transition-all duration-200 flex items-center justify-center ${t.outlineBtn}`}
              >
                <Plus className="w-5 h-5 mr-2" />
                AGREGAR A LA LISTA
              </button>
            </div>

            {/* Formula Note */}
            <p className="mt-6 text-xs text-center text-gray-400 font-medium">
              El sistema convierte automáticamente a pulgadas para el cálculo.
              <br />Fórmula base: (Volumen pulg³) / 144
            </p>

          </form>

          <ResultCard result={result} theme={theme} />
        </div>

        {/* Budget List & Export Section */}
        <BudgetList items={budgetItems} onDelete={removeFromBudget} theme={theme} />

      </div>
    </div>
  );
}
