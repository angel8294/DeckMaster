'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TemplateOption {
  id: string;
  name: string;
  preview: string;
  description: string;
}

const templates: TemplateOption[] = [
  {
    id: 'corporate',
    name: 'Corporativo',
    preview: '/templates/corporate.png',
    description: 'Diseño profesional y sobrio para presentaciones empresariales'
  },
  {
    id: 'pitch-deck',
    name: 'Pitch Deck',
    preview: '/templates/pitch.png',
    description: 'Optimizado para presentaciones a inversionistas'
  },
  {
    id: 'creative',
    name: 'Creativo',
    preview: '/templates/creative.png',
    description: 'Diseño moderno y dinámico para ideas innovadoras'
  },
  // Más plantillas...
];

export default function NewPresentationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    audience: '',
    slides: 8,
    objective: '',
    language: 'es'
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la llamada a la API para generar la presentación
    // Por ahora simulamos con un timeout
    router.push('/editor/new-presentation-id');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {step === 1 ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Elige una Plantilla</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Selecciona el estilo que mejor se adapte a tu presentación</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'ring-2 ring-indigo-500'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {template.preview ? (
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">Vista previa no disponible</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Detalles de la Presentación</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Configura los parámetros principales</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Objetivo
              </label>
              <textarea
                id="objective"
                name="objective"
                value={formData.objective}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Público Objetivo
                </label>
                <input
                  type="text"
                  id="audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="slides" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de Diapositivas
                </label>
                <input
                  type="number"
                  id="slides"
                  name="slides"
                  value={formData.slides}
                  onChange={handleInputChange}
                  min={3}
                  max={20}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Crear Presentación
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}