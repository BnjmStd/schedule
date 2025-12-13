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

// 📚 Plantillas de asignaturas predefinidas
const SUBJECT_TEMPLATES = [
  {
    category: 'Ciencias Exactas',
    subjects: [
      { name: 'Matemáticas', code: 'MAT', description: 'Álgebra, geometría y cálculo', color: '#3B82F6' },
      { name: 'Física', code: 'FIS', description: 'Mecánica, termodinámica y electromagnetismo', color: '#8B5CF6' },
      { name: 'Química', code: 'QUI', description: 'Química orgánica e inorgánica', color: '#06B6D4' },
    ]
  },
  {
    category: 'Lenguaje y Comunicación',
    subjects: [
      { name: 'Lenguaje y Literatura', code: 'LEN', description: 'Comprensión lectora y expresión escrita', color: '#EC4899' },
      { name: 'Inglés', code: 'ING', description: 'Inglés como segunda lengua', color: '#F59E0B' },
      { name: 'Francés', code: 'FRA', description: 'Francés como lengua extranjera', color: '#EF4444' },
    ]
  },
  {
    category: 'Ciencias Sociales',
    subjects: [
      { name: 'Historia y Geografía', code: 'HIS', description: 'Historia universal y de Chile', color: '#10B981' },
      { name: 'Educación Cívica', code: 'CIV', description: 'Formación ciudadana', color: '#14B8A6' },
      { name: 'Filosofía', code: 'FIL', description: 'Pensamiento crítico y ética', color: '#6366F1' },
    ]
  },
  {
    category: 'Ciencias Naturales',
    subjects: [
      { name: 'Biología', code: 'BIO', description: 'Ciencias de la vida', color: '#22C55E' },
      { name: 'Ciencias Naturales', code: 'NAT', description: 'Ciencias integradas', color: '#84CC16' },
    ]
  },
  {
    category: 'Artes y Educación Física',
    subjects: [
      { name: 'Artes Visuales', code: 'ART', description: 'Pintura, dibujo y escultura', color: '#F472B6' },
      { name: 'Música', code: 'MUS', description: 'Teoría musical y práctica instrumental', color: '#A855F7' },
      { name: 'Educación Física', code: 'EDF', description: 'Deportes y actividad física', color: '#F97316' },
    ]
  },
  {
    category: 'Tecnología',
    subjects: [
      { name: 'Tecnología', code: 'TEC', description: 'Diseño y tecnología digital', color: '#06B6D4' },
      { name: 'Computación', code: 'COM', description: 'Programación y ofimática', color: '#3B82F6' },
    ]
  }
];

export function CreateSubjectForm() {
  const router = useRouter();
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState('');
  const [creationMode, setCreationMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof SUBJECT_TEMPLATES[0]['subjects'][0] | null>(null);

  useEffect(() => {
    const loadSchools = async () => {
      const data = await getSchools();
      setSchools(data);
    };
    loadSchools();
  }, []);

  const handleTemplateSelect = (template: typeof SUBJECT_TEMPLATES[0]['subjects'][0]) => {
    setSelectedTemplate(template);
  };

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

      {/* Toggle de modo */}
      <div className="subject-mode-toggle">
        <button
          type="button"
          className={`subject-mode-btn ${creationMode === 'template' ? 'active' : ''}`}
          onClick={() => setCreationMode('template')}
        >
          <span>✨</span>
          Desde Plantilla
        </button>
        <button
          type="button"
          className={`subject-mode-btn ${creationMode === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setCreationMode('custom');
            setSelectedTemplate(null);
          }}
        >
          <span>✏️</span>
          Personalizado
        </button>
      </div>

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

      {/* Plantillas */}
      {creationMode === 'template' && (
        <div className="subject-templates">
          <label className="form-label">Selecciona una asignatura</label>
          {SUBJECT_TEMPLATES.map((category) => (
            <div key={category.category} className="template-category">
              <h4 className="template-category-title">{category.category}</h4>
              <div className="template-grid">
                {category.subjects.map((template) => (
                  <button
                    key={template.code}
                    type="button"
                    className={`template-card ${selectedTemplate?.code === template.code ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                    style={{ '--template-color': template.color } as React.CSSProperties}
                  >
                    <div className="template-selected-badge">✓ Seleccionada</div>
                    <div className="template-header">
                      <div className="template-info">
                        <h5 className="template-name">{template.name}</h5>
                        <span className="template-code">{template.code}</span>
                      </div>
                      <div 
                        className="template-color" 
                        style={{ backgroundColor: template.color }}
                      />
                    </div>
                    <p className="template-description">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campos del formulario */}
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
            value={selectedTemplate?.name}
            onChange={(e) => {
              if (selectedTemplate) {
                setSelectedTemplate({ ...selectedTemplate, name: e.target.value });
              }
            }}
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
            value={selectedTemplate?.code}
            onChange={(e) => {
              if (selectedTemplate) {
                setSelectedTemplate({ ...selectedTemplate, code: e.target.value });
              }
            }}
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
          value={selectedTemplate?.description}
          onChange={(e) => {
            if (selectedTemplate) {
              setSelectedTemplate({ ...selectedTemplate, description: e.target.value });
            }
          }}
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
            value={selectedTemplate?.color || '#3aa6ff'}
            disabled={isLoading}
            onChange={(e) => {
              if (selectedTemplate) {
                setSelectedTemplate({ ...selectedTemplate, color: e.target.value });
              }
            }}
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
