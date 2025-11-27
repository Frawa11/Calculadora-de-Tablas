
import React from 'react';
import { BudgetItem, ThemeColor } from '../types';
import { Trash2, FileSpreadsheet, Download } from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

interface BudgetListProps {
  items: BudgetItem[];
  onDelete: (id: string) => void;
  theme: ThemeColor;
}

export const BudgetList: React.FC<BudgetListProps> = ({ items, onDelete, theme }) => {
  if (items.length === 0) return null;

  // Calculate Grand Totals
  const totalBF = items.reduce((acc, item) => acc + item.result.boardFeet, 0);
  const totalM3 = items.reduce((acc, item) => acc + item.result.cubicMeters, 0);
  const totalCost = items.reduce((acc, item) => acc + item.result.totalCost, 0);

  const exportToExcel = async () => {
    try {
      // Check and request permissions first
      let permStatus = await Filesystem.checkPermissions();

      if (permStatus.publicStorage !== 'granted') {
        permStatus = await Filesystem.requestPermissions();
      }

      if (permStatus.publicStorage !== 'granted') {
        alert('Permiso de almacenamiento no concedido. No se puede guardar el archivo.');
        return;
      }

      // 1. Define Headers
      const headers = [
        "ID",
        "Largo (Valor)", "Largo (Unidad)",
        "Ancho (Valor)", "Ancho (Unidad)",
        "Grosor (Valor)", "Grosor (Unidad)",
        "Precio Unitario (S/.)",
        "Pies Tabla (BF)",
        "Metros Cúbicos (m3)",
        "Costo Total (S/.)"
      ];

      // 2. Map Data Rows
      const rows = items.map((item, index) => [
        index + 1,
        item.dimensions.length, item.dimensions.lengthUnit,
        item.dimensions.width, item.dimensions.widthUnit,
        item.dimensions.thickness, item.dimensions.thicknessUnit,
        item.dimensions.price,
        item.result.boardFeet.toFixed(2),
        item.result.cubicMeters.toFixed(6),
        item.result.totalCost.toFixed(2)
      ]);

      // 3. Add Summary Row
      const summaryRow = [
        "", "", "", "", "", "", "TOTALES:", "",
        totalBF.toFixed(2),
        totalM3.toFixed(6),
        totalCost.toFixed(2)
      ];

      // 4. Construct CSV Content
      const csvContent = "\uFEFF" + [
        headers.join(","),
        ...rows.map(e => e.join(",")),
        summaryRow.join(",")
      ].join("\n");

      // 5. Save file to device using Capacitor Filesystem
      const fileName = `Presupuesto_Madera_${new Date().toISOString().slice(0,10)}.csv`;
      
      const result = await Filesystem.writeFile({
        path: fileName,
        data: csvContent,
        directory: Directory.Documents, // Saves to the user's Documents folder
        encoding: Encoding.UTF8,
        recursive: true, // Create parent directories if they don't exist
      });

      alert(`Archivo guardado con éxito en la carpeta de Documentos: ${fileName}`);

    } catch (e) {
      console.error('No se pudo guardar el archivo', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Error al guardar: ${errorMessage}`);
    }
  };

  const themeStyles = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-800', highlight: 'text-amber-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-800', highlight: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-800', highlight: 'text-emerald-700' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-800', highlight: 'text-indigo-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-800', highlight: 'text-rose-700' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-800', highlight: 'text-slate-700' },
  }[theme];

  return (
    <div className="mt-8 bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden animate-fade-in-up">
      <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FileSpreadsheet className="w-6 h-6 text-green-600 mr-2" />
          Detalle del Presupuesto
        </h3>
        <button
          onClick={exportToExcel}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dim. Originales</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">P. Unit (S/. / BF)</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Volumen (BF)</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Costo (S/.)</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-gray-500">L: <span className="text-gray-900 font-bold">{item.dimensions.length} {item.dimensions.lengthUnit}</span></span>
                    <span className="text-xs text-gray-500">A: <span className="text-gray-900 font-bold">{item.dimensions.width} {item.dimensions.widthUnit}</span></span>
                    <span className="text-xs text-gray-500">G: <span className="text-gray-900 font-bold">{item.dimensions.thickness} {item.dimensions.thicknessUnit}</span></span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                  S/. {item.dimensions.price}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-mono">
                  {item.result.boardFeet.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                  S/. {item.result.totalCost.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className={`${themeStyles.bg} font-bold text-gray-900`}>
            <tr>
              <td colSpan={3} className={`px-4 py-4 text-right uppercase text-xs tracking-wider ${themeStyles.text}`}>Totales:</td>
              <td className="px-4 py-4 text-right">{totalBF.toFixed(2)} BF</td>
              <td className={`px-4 py-4 text-right ${themeStyles.highlight}`}>S/. {totalCost.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
