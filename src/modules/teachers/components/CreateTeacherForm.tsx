/**
 * 👨‍🏫 CreateTeacherForm - Formulario para crear un nuevo profesor
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/ModalContext';
import { createTeacher } from '@/modules/teachers/actions';
import { getSchools } from '@/modules/schools/actions';
import { Input, Select } from '@/components/ui';
import type { School } from '@/types';
import './TeacherForms.css';

export function CreateTeacherForm() {
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
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      specialization: formData.get('specialization') as string || undefined,
    };

    try {
      await createTeacher(data);
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el profesor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="teacher-form">
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
          <label htmlFor="firstName" className="form-label">
            Nombre <span className="required">*</span>
          </label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Ej: María"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Apellido <span className="required">*</span>
          </label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Ej: González"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email <span className="required">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ej: maria.gonzalez@colegio.cl"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Teléfono
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Ej: +56 9 1234 5678"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialization" className="form-label">
          Especialización
        </label>
        <Input
          id="specialization"
          name="specialization"
          type="text"
          placeholder="Ej: Matemáticas y Física"
          disabled={isLoading}
        />
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
          {isLoading ? 'Creando...' : 'Crear Profesor'}
        </button>
      </div>
    </form>
  );
}
