/**
 * 📚 CreateSubjectForm - Formulario para crear una nueva asignatura
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/ModalContext';
import { createSubject } from '@/modules/subjects/actions';
import { getSchools } from '@/modules/schools/actions';
import { Input, Select } from '@/components/ui';
import type { School } from '@/types';
import './SubjectForms.css';

export function CreateSubjectForm() {
  const router = useRouter();
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSchools = async () => {
      const data = await getSchools();
      setSchools(data);
    };
    loadSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      schoolId: formData.get('schoolId') as string,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string || undefined,
      color: formData.get('color') as string || undefined,
    };

    try {
      await createSubject(data);
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la asignatura');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="subject-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="schoolId" className="form-label">
          Colegio <span className="required">*</span>
        </label>
        <Select
          id="schoolId"
          name="schoolId"
          required
          disabled={isLoading}
          options={schools.map(school => ({
            value: school.id,
            label: school.name
          }))}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Nombre <span className="required">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ej: Matemáticas"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="code" className="form-label">
            Código <span className="required">*</span>
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="Ej: MAT101"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción
        </label>
        <Input
          id="description"
          name="description"
          type="text"
          placeholder="Ej: Matemáticas para educación básica"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="color" className="form-label">
          Color (para visualización)
        </label>
        <div className="color-input-wrapper">
          <Input
            id="color"
            name="color"
            type="color"
            defaultValue="#3aa6ff"
            disabled={isLoading}
          />
          <span className="color-hint">Selecciona un color para identificar la asignatura</span>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="auth-button auth-button-outline"
          onClick={closeModal}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="auth-button auth-button-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear Asignatura'}
        </button>
      </div>
    </form>
  );
}
