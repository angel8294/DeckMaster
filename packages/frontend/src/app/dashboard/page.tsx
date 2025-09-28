'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Presentation {
  id: string;
  title: string;
  slides: number;
  lastModified: string;
  thumbnail?: string;
}

export default function DashboardPage() {
  const [presentations] = useState<Presentation[]>([
    {
      id: '1',
      title: 'Pitch Startup Tech',
      slides: 12,
      lastModified: '2025-09-25T14:30:00Z',
      thumbnail: '/preview-pitch.png'
    },
    // Más presentaciones de ejemplo aquí...
  ]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mis Presentaciones</h1>
          <Link
            href="/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nueva Presentación
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((pres) => (
            <div
              key={pres.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
                {pres.thumbnail ? (
                  <img
                    src={pres.thumbnail}
                    alt={pres.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">Sin vista previa</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {pres.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pres.slides} diapositivas · {new Date(pres.lastModified).toLocaleDateString()}
                </p>
                <div className="mt-4 flex space-x-3">
                  <Link
                    href={`/editor/${pres.id}`}
                    className="flex-1 text-center px-3 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900"
                  >
                    Editar
                  </Link>
                  <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}