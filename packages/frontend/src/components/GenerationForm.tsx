'use client';

import { useEffect, useState } from 'react';

function base64ToBlob(base64: string, mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export default function GenerationForm() {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('');
  const [slides, setSlides] = useState(8);
  const [style, setStyle] = useState('corporate');
  const [language, setLanguage] = useState('es');

  const [loading, setLoading] = useState(false); // for initial submit
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<any | null>(null); // final result from server
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Polling for job status
  useEffect(() => {
    if (!jobId) return;
    setJobStatus('processing');
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/job/${jobId}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJobStatus(data.status);
        if (data.status === 'done') {
          setPresentation(data.result || null);
          setJobId(null);
          clearInterval(interval);
        }
        if (data.status === 'failed') {
          setError('La generación falló en el servidor.');
          setJobId(null);
          clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message || 'Error checking job status');
        setJobId(null);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPresentation(null);

    try {
      const res = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, audience, slides, style, language }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error en la petición de generación');
      }

      const data = await res.json();
      // Do not show the job JSON to the user. Start polling instead.
      setJobId(data.jobId);
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!presentation || !presentation.slides) {
      setError('No hay presentación disponible para exportar.');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: presentation.slides }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error en la exportación');
      }

      const { pptx } = await res.json();
      if (!pptx) throw new Error('No se recibió el archivo .pptx');

      const blob = base64ToBlob(pptx);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(title || 'presentation').replace(/\s+/g, '_')}.pptx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  const isProcessing = Boolean(jobId) || jobStatus === 'processing';

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">DeckMaster AI</h1>
      <p className="text-center text-gray-600 dark:text-gray-300">Crea presentaciones profesionales en segundos.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Título de la Presentación</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lanzamiento App Saludable" className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
        </div>

        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Público Objetivo</label>
          <input id="audience" type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="inversionistas tech" className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
        </div>

        <div>
          <label htmlFor="slides" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Número de Diapositivas</label>
          <input id="slides" type="number" value={slides} onChange={(e) => setSlides(parseInt(e.target.value, 10))} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required min={3} max={20} />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Estilo de Plantilla</label>
          <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="corporate">Corporativo</option>
            <option value="creative">Creativo</option>
            <option value="minimal">Minimalista</option>
            <option value="pitch-deck">Pitch Deck</option>
            <option value="academic">Académico</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Idioma</label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        <div>
          <button type="submit" disabled={loading || isProcessing} className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            {loading || isProcessing ? 'Generando...' : 'Generar Presentación'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-md dark:bg-gray-700">
        {isProcessing && (
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-200">Procesando tu presentación... por favor espera.</p>
          </div>
        )}

        {!isProcessing && presentation && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">¡Presentación Generada!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tu presentación está lista. Puedes descargar el archivo .pptx o continuar editando el contenido.</p>
            <button onClick={handleExport} disabled={exporting} className="w-full px-4 py-2 mt-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400">{exporting ? 'Exportando...' : 'Descargar .pptx'}</button>
          </div>
        )}

        {!isProcessing && !presentation && !error && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">El resultado de tu presentación aparecerá aquí.</div>
        )}
      </div>
    </div>
  );
}
