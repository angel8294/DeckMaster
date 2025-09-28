'use client';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, options: any) => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Exportar Presentación</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato
            </label>
            <select className="w-full rounded-md border-gray-300 dark:border-gray-600">
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opciones
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Incluir notas del presentador</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Optimizar imágenes</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Compresión para web</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onExport('pptx', {})}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}