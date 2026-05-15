'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

interface CoachNoteFormProps {
  sessionId: string;
  onSuccess?: () => void;
}

export default function CoachNoteForm({ sessionId, onSuccess }: CoachNoteFormProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      setToast({ message: 'La nota no puede estar vacía', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/coach-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, note }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la nota');
      }

      setToast({ message: 'Nota guardada correctamente', type: 'success' });
      setNote('');
      onSuccess?.();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="note" className="block text-sm font-medium text-gray-900 mb-2">
          Nota del Entrenador
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe una nota sobre esta sesión..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={4}
        />
        <div className="mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar nota'}
          </Button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
