"use client";

import { useState, useEffect } from "react";
import { getSubjects } from "@/modules/subjects/actions";
import { createSubject } from "@/modules/subjects/actions";
import { getSchools } from "@/modules/schools/actions";
import { Input, Select } from "@/components/ui";
import type { School } from "@/types";
import "../../subjects.css";

// Tipo para subject con relaciones incluidas
type SubjectWithRelations = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
  school: {
    name: string;
  };
  teacherSubjects: Array<{
    id: string;
    teacherId: string;
    subjectId: string;
    teacher: {
      firstName: string;
      lastName: string;
    };
  }>;
};

// 📚 Plantillas de asignaturas predefinidas
const SUBJECT_TEMPLATES = [
  {
    category: "Ciencias Exactas",
    subjects: [
      {
        name: "Matemáticas",
        code: "MAT",
        description: "Álgebra, geometría y cálculo",
        color: "#3B82F6",
      },
      {
        name: "Física",
        code: "FIS",
        description: "Mecánica, termodinámica y electromagnetismo",
        color: "#8B5CF6",
      },
      {
        name: "Química",
        code: "QUI",
        description: "Química orgánica e inorgánica",
        color: "#06B6D4",
      },
    ],
  },
  {
    category: "Lenguaje y Comunicación",
    subjects: [
      {
        name: "Lenguaje y Literatura",
        code: "LEN",
        description: "Comprensión lectora y expresión escrita",
        color: "#EC4899",
      },
      {
        name: "Inglés",
        code: "ING",
        description: "Inglés como segunda lengua",
        color: "#F59E0B",
      },
      {
        name: "Francés",
        code: "FRA",
        description: "Francés como lengua extranjera",
        color: "#EF4444",
      },
    ],
  },
  {
    category: "Ciencias Sociales",
    subjects: [
      {
        name: "Historia y Geografía",
        code: "HIS",
        description: "Historia universal y de Chile",
        color: "#10B981",
      },
      {
        name: "Educación Cívica",
        code: "CIV",
        description: "Formación ciudadana",
        color: "#14B8A6",
      },
      {
        name: "Filosofía",
        code: "FIL",
        description: "Pensamiento crítico y ética",
        color: "#6366F1",
      },
    ],
  },
  {
    category: "Ciencias Naturales",
    subjects: [
      {
        name: "Biología",
        code: "BIO",
        description: "Ciencias de la vida",
        color: "#22C55E",
      },
      {
        name: "Ciencias Naturales",
        code: "NAT",
        description: "Ciencias integradas",
        color: "#84CC16",
      },
    ],
  },
  {
    category: "Artes y Educación Física",
    subjects: [
      {
        name: "Artes Visuales",
        code: "ART",
        description: "Pintura, dibujo y escultura",
        color: "#F472B6",
      },
      {
        name: "Música",
        code: "MUS",
        description: "Teoría musical y práctica instrumental",
        color: "#A855F7",
      },
      {
        name: "Educación Física",
        code: "EDF",
        description: "Deportes y actividad física",
        color: "#F97316",
      },
    ],
  },
  {
    category: "Tecnología",
    subjects: [
      {
        name: "Tecnología",
        code: "TEC",
        description: "Diseño y tecnología digital",
        color: "#06B6D4",
      },
      {
        name: "Computación",
        code: "COM",
        description: "Programación y ofimática",
        color: "#3B82F6",
      },
    ],
  },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectWithRelations[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creationMode, setCreationMode] = useState<"template" | "custom">(
    "template"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof SUBJECT_TEMPLATES)[0]["subjects"][0] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Accordion state - todas las categorías abiertas por defecto
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    SUBJECT_TEMPLATES.reduce((acc, cat) => {
      acc[cat.category] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Form state
  const [formData, setFormData] = useState({
    schoolId: "",
    name: "",
    code: "",
    description: "",
    color: "#3B82F6",
  });

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      const [subjectsData, schoolsData] = await Promise.all([
        getSubjects(),
        getSchools(),
      ]);
      setSubjects(subjectsData);
      setSchools(schoolsData);
      
      // Si solo hay un colegio, auto-seleccionarlo
      if (schoolsData.length === 1 && formData.schoolId === '') {
        setFormData(prev => ({
          ...prev,
          schoolId: schoolsData[0].id
        }));
      }
    };
    loadData();
  }, []);

  const handleTemplateSelect = (
    template: (typeof SUBJECT_TEMPLATES)[0]["subjects"][0]
  ) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      code: template.code,
      description: template.description,
      color: template.color,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log('Submitting subject with data:', {
      schoolId: formData.schoolId,
      name: formData.name,
      code: formData.code,
    });
    console.log('Available schools:', schools.map(s => ({ id: s.id, name: s.name })));

    try {
      await createSubject({
        schoolId: formData.schoolId,
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        color: formData.color || undefined,
      });

      // Reload subjects
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);

      // Reset form
      setShowCreateForm(false);
      setSelectedTemplate(null);
      setFormData({
        schoolId: "",
        name: "",
        code: "",
        description: "",
        color: "#3B82F6",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la asignatura"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>

      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">📚 Asignaturas</h1>
            <button
              className="schools-add-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "✕ Cancelar" : "+ Agregar Asignatura"}
            </button>
          </div>
          <p className="schools-description">
            {showCreateForm
              ? "Selecciona una plantilla o crea una asignatura personalizada"
              : "Gestiona las asignaturas disponibles y asígnalas a profesores calificados."}
          </p>
        </header>

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="subject-create-section">
            <form onSubmit={handleSubmit} className="subject-form">
              {/* Mode Toggle */}
              <div className="subject-mode-toggle">
                <button
                  type="button"
                  className={`subject-mode-btn ${
                    creationMode === "template" ? "active" : ""
                  }`}
                  onClick={() => {
                    setCreationMode("template");
                    if (selectedTemplate) {
                      setFormData((prev) => ({
                        ...prev,
                        name: selectedTemplate.name,
                        code: selectedTemplate.code,
                        description: selectedTemplate.description,
                        color: selectedTemplate.color,
                      }));
                    }
                  }}
                >
                  <span>✨</span>
                  Desde Plantilla
                </button>
                <button
                  type="button"
                  className={`subject-mode-btn ${
                    creationMode === "custom" ? "active" : ""
                  }`}
                  onClick={() => {
                    setCreationMode("custom");
                    setSelectedTemplate(null);
                  }}
                >
                  <span>✏️</span>
                  Personalizado
                </button>
              </div>

              {/* Plantillas */}
              {creationMode === "template" && (
                <div className="subject-templates">
                  {SUBJECT_TEMPLATES.map((category) => (
                    <div key={category.category} className="template-category">
                      <div className="template-category-header">
                        <h4 className="template-category-title">
                          {category.category}
                        </h4>
                        <button
                          type="button"
                          className="template-category-toggle"
                          onClick={() => toggleCategory(category.category)}
                          aria-label={openCategories[category.category] ? 'Cerrar' : 'Abrir'}
                        >
                          <span className={`toggle-icon ${openCategories[category.category] ? 'open' : ''}`}>
                            ▼
                          </span>
                        </button>
                      </div>
                      {openCategories[category.category] && (
                        <div className="template-grid">
                        {category.subjects.map((template) => (
                          <button
                            key={template.code}
                            type="button"
                            className={`template-card ${
                              selectedTemplate?.code === template.code
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                            style={
                              {
                                "--template-color": template.color,
                              } as React.CSSProperties
                            }
                          >
                            <div className="template-selected-badge">
                              ✓ Seleccionada
                            </div>
                            <div className="template-header">
                              <div className="template-info">
                                <h5 className="template-name">
                                  {template.name}
                                </h5>
                                <span className="template-code">
                                  {template.code}
                                </span>
                              </div>
                              <div
                                className="template-color"
                                style={{ backgroundColor: template.color }}
                              />
                            </div>
                            <p className="template-description">
                              {template.description}
                            </p>
                          </button>
                        ))}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* School selector */}
              <div className="form-group">
                <label htmlFor="schoolId" className="form-label">
                  Colegio <span className="required">*</span>
                </label>
                <Select
                  id="schoolId"
                  name="schoolId"
                  required
                  disabled={isLoading}
                  value={formData.schoolId}
                  onChange={(e) => {
                    console.log('Select changed to:', e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      schoolId: e.target.value,
                    }));
                  }}
                  placeholder="Selecciona un colegio"
                  options={schools.map((school) => ({
                    value: school.id,
                    label: school.name,
                  }))}
                />
              </div>

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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
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
                    placeholder="Ej: MAT"
                    required
                    disabled={isLoading}
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
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
                  placeholder="Descripción breve de la asignatura"
                  disabled={isLoading}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="color" className="form-label">
                  Color
                </label>
                <div className="color-input-wrapper">
                  <input
                    id="color"
                    name="color"
                    type="color"
                    disabled={isLoading}
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                  />
                  <span className="color-hint">
                    Color para identificar la asignatura
                  </span>
                </div>
              </div>

              {error && (
                <div
                  className="form-error"
                  style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.75rem",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <div
                className="form-actions"
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isLoading}
                  className="auth-button auth-button-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-button auth-button-primary"
                >
                  {isLoading ? "Creando..." : "Crear Asignatura"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de asignaturas */}
        {!showCreateForm && (
          <>
            {subjects.length === 0 ? (
              <div className="schools-empty">
                <div className="schools-empty-icon">📚</div>
                <p className="schools-empty-title">
                  No hay asignaturas registradas
                </p>
                <p className="schools-empty-subtitle">
                  Comienza agregando tu primera asignatura
                </p>
              </div>
            ) : (
              <div className="schools-grid">
                {subjects.map((subject) => (
                  <div key={subject.id} className="schools-card">
                    <div className="schools-card-header">
                      <div>
                        <h3 className="schools-card-title">{subject.name}</h3>
                      </div>
                      <span
                        className="schools-card-badge"
                        style={{
                          background: subject.color
                            ? `${subject.color}33`
                            : undefined,
                          borderColor: subject.color
                            ? `${subject.color}66`
                            : undefined,
                        }}
                      >
                        {subject.code}
                      </span>
                    </div>

                    <div className="schools-card-info">
                      <div className="schools-card-info-item">
                        <span className="schools-card-info-icon">🏫</span>
                        <span>{subject.school.name}</span>
                      </div>
                      {subject.teacherSubjects.length > 0 && (
                        <div className="schools-card-info-item">
                          <span className="schools-card-info-icon">👨‍🏫</span>
                          <span>
                            {subject.teacherSubjects.length} profesor
                            {subject.teacherSubjects.length !== 1 ? "es" : ""}
                          </span>
                        </div>
                      )}
                      {subject.description && (
                        <div className="schools-card-info-item">
                          <span className="schools-card-info-icon">📝</span>
                          <span>{subject.description}</span>
                        </div>
                      )}
                    </div>

                    <div className="schools-card-footer">
                      <button className="schools-card-btn schools-card-btn-primary">
                        Ver Detalles
                      </button>
                      <button className="schools-card-btn schools-card-btn-ghost">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
