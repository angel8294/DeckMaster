'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes?: string;
  image_url?: string;
  layout_hint?: string;
}

export default function EditorPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Simular carga de datos
    setLoading(false);
    setSlides([
      {
        id: '1',
        title: 'Introducción',
        bullets: ['Punto 1', 'Punto 2', 'Punto 3'],
        notes: 'Notas del presentador para la introducción',
        layout_hint: 'title-slide'
      },
      // Más slides...
    ]);
  }, [params.id]);

  const handleExport = () => {
    // Mostrar modal de exportación
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar con miniaturas */}
      <div className="w-64 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Diapositivas</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-500">+ Nueva</button>
          </div>
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setSelectedSlide(slide)}
                className={`p-2 rounded cursor-pointer ${
                  selectedSlide?.id === slide.id
                    ? 'bg-indigo-50 dark:bg-indigo-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="aspect-w-16 aspect-h-9 bg-white dark:bg-gray-600 rounded mb-2">
                  {/* Miniatura */}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Diapositiva {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor central */}
      <div className="flex-1 overflow-y-auto">
        {selectedSlide && (
          <div className="p-6 max-w-3xl mx-auto">
            <input
              type="text"
              value={selectedSlide.title}
              onChange={(e) => {
                // Actualizar título
              }}
              className="w-full text-2xl font-bold mb-4 bg-transparent border-0 focus:ring-0"
            />
            <div className="space-y-4">
              {selectedSlide.bullets.map((bullet, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="mt-2">•</span>
                  <textarea
                    value={bullet}
                    onChange={(e) => {
                      // Actualizar bullet
                    }}
                    rows={1}
                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none"
                  />
                </div>
              ))}
            </div>
            {selectedSlide.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas del Presentador</h3>
                <textarea
                  value={selectedSlide.notes}
                  onChange={(e) => {
                    // Actualizar notas
                  }}
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel derecho - Canvas y controles */}
      <div className="w-96 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1 text-sm rounded-md bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-50"
            >
              {previewMode ? 'Editar' : 'Vista Previa'}
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Exportar
            </button>
          </div>

          <div className="aspect-w-16 aspect-h-9 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
            {/* Canvas de vista previa */}
          </div>

          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plantilla
              </label>
              <select className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                <option value="default">Predeterminada</option>
                <option value="modern">Moderna</option>
                <option value="minimal">Minimalista</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estilo
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button className="w-8 h-8 rounded-full bg-blue-500" />
                <button className="w-8 h-8 rounded-full bg-green-500" />
                <button className="w-8 h-8 rounded-full bg-purple-500" />
                <button className="w-8 h-8 rounded-full bg-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}