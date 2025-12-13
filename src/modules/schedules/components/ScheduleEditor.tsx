/**
 * 🎨 ScheduleEditor - Editor visual de horarios tipo Excalidraw
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { saveSchedule } from '@/modules/schedules/actions';
import { getSubjects } from '@/modules/subjects/actions';
import { getTeachers } from '@/modules/teachers/actions';
import { getCourses } from '@/modules/courses/actions';

interface ScheduleBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string;
  course?: string;
  color: string;
}

interface ScheduleEditorProps {
  entityId: string;
  entityType: 'course' | 'teacher';
  entityName: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DAYS = [
  { key: 'MONDAY', label: 'Lunes' },
  { key: 'TUESDAY', label: 'Martes' },
  { key: 'WEDNESDAY', label: 'Miércoles' },
  { key: 'THURSDAY', label: 'Jueves' },
  { key: 'FRIDAY', label: 'Viernes' },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const PREDEFINED_COLORS = [
  '#B4D7FF', '#FFB4D7', '#FFFBB4', '#FFD7B4', '#D7B4FF', 
  '#B4FFD7', '#FFB4E5', '#B4FFEB', '#FFC4E7', '#B4EAFF'
];

export function ScheduleEditor({ entityId, entityType, entityName }: ScheduleEditorProps) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedBlocksRef = useRef<string>('');
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  
  // Estados para datos reales
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [newBlock, setNewBlock] = useState({
    day: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    subjectId: '',
    detail: '', // teacher o course según el tipo
    detailId: '',
    color: PREDEFINED_COLORS[0]
  });

  // Cargar datos reales al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [subjectsData, teachersData, coursesData] = await Promise.all([
          getSubjects(),
          getTeachers(),
          getCourses(),
        ]);
        setSubjects(subjectsData);
        setTeachers(teachersData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Función de guardado automático
  const autoSave = useCallback(async (blocksToSave: ScheduleBlock[]) => {
    try {
      setSaveStatus('saving');
      
      await saveSchedule({
        courseId: entityId,
        entityType,
        blocks: blocksToSave,
      });

      lastSavedBlocksRef.current = JSON.stringify(blocksToSave);
      setSaveStatus('saved');

      // Después de 2 segundos, volver a idle
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error guardando automáticamente:', error);
      setSaveStatus('error');
      
      // Después de 3 segundos, volver a idle
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [entityId, entityType]);

  // Effect para guardado automático con debounce
  useEffect(() => {
    const currentBlocksString = JSON.stringify(blocks);
    
    // No guardar si no hay cambios
    if (currentBlocksString === lastSavedBlocksRef.current) {
      return;
    }

    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Establecer nuevo timeout de 2 segundos
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(blocks);
    }, 2000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, autoSave]);

  const handleAddBlock = () => {
    if (!newBlock.subjectId || !newBlock.detailId) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Obtener nombres reales de las entidades seleccionadas
    const selectedSubject = subjects.find(s => s.id === newBlock.subjectId);
    const subjectName = selectedSubject?.name || newBlock.subject;
    const subjectColor = selectedSubject?.color || newBlock.color;

    let detailName = newBlock.detail;
    if (entityType === 'course') {
      const selectedTeacher = teachers.find(t => t.id === newBlock.detailId);
      detailName = selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : newBlock.detail;
    } else {
      const selectedCourse = courses.find(c => c.id === newBlock.detailId);
      detailName = selectedCourse?.name || newBlock.detail;
    }

    const block: ScheduleBlock = {
      id: `${Date.now()}`,
      day: newBlock.day,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      subject: subjectName,
      ...(entityType === 'course' ? { teacher: detailName } : { course: detailName }),
      color: subjectColor
    };

    setBlocks([...blocks, block]);
    setIsAddingBlock(false);
    setNewBlock({
      day: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      subject: '',
      subjectId: '',
      detail: '',
      detailId: '',
      color: PREDEFINED_COLORS[0]
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    setSelectedBlock(null);
  };

  const getBlocksForSlot = (day: string, time: string) => {
    return blocks.filter(b => b.day === day && b.startTime === time);
  };

  // Renderizar indicador de estado de guardado
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="schedule-save-status saving">
            <div className="schedule-save-spinner"></div>
            <span>Guardando...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="schedule-save-status saved">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Guardado</span>
          </div>
        );
      case 'error':
        return (
          <div className="schedule-save-status error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>Error al guardar</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="schedule-editor">
      {/* Toolbar */}
      <div className="schedule-editor-toolbar">
        <button 
          className="schedule-toolbar-btn primary"
          onClick={() => setIsAddingBlock(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Agregar Bloque
        </button>
        
        <div className="schedule-toolbar-spacer"></div>
        
        {renderSaveStatus()}
        
        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          {blocks.length} {blocks.length === 1 ? 'bloque' : 'bloques'}
        </div>
      </div>

      {/* Canvas principal */}
      <div className="schedule-editor-canvas">
        <div className="schedule-editor-grid">
          {/* Header */}
          <div className="schedule-editor-grid-header">
            <div className="schedule-editor-time-header">Horario</div>
            {DAYS.map(day => (
              <div key={day.key} className="schedule-editor-day-header">
                {day.label}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="schedule-editor-grid-body">
            {TIME_SLOTS.slice(0, -1).map((time, index) => (
              <div key={time} className="schedule-editor-grid-row">
                <div className="schedule-editor-time-cell">
                  {time} - {TIME_SLOTS[index + 1]}
                </div>
                {DAYS.map(day => {
                  const cellBlocks = getBlocksForSlot(day.key, time);
                  return (
                    <div
                      key={`${day.key}-${time}`}
                      className="schedule-editor-cell"
                      onClick={() => {
                        if (cellBlocks.length === 0) {
                          setNewBlock({
                            ...newBlock,
                            day: day.key,
                            startTime: time,
                            endTime: TIME_SLOTS[index + 1]
                          });
                          setIsAddingBlock(true);
                        }
                      }}
                    >
                      {cellBlocks.map(block => (
                        <div
                          key={block.id}
                          className="schedule-editor-block"
                          style={{ backgroundColor: block.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlock(block);
                          }}
                        >
                          <div className="schedule-editor-block-subject">
                            {block.subject}
                          </div>
                          <div className="schedule-editor-block-detail">
                            {entityType === 'course' ? block.teacher : block.course}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para agregar bloque */}
      {isAddingBlock && (
        <div className="schedule-editor-modal-overlay" onClick={() => setIsAddingBlock(false)}>
          <div className="schedule-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="schedule-editor-modal-header">
              <h3>Agregar Bloque de Clase</h3>
              <button onClick={() => setIsAddingBlock(false)} className="schedule-editor-modal-close">
                ×
              </button>
            </div>
            
            <div className="schedule-editor-modal-body">
              <div className="schedule-editor-form-group">
                <label>Día</label>
                <select
                  value={newBlock.day}
                  onChange={(e) => setNewBlock({ ...newBlock, day: e.target.value })}
                >
                  {DAYS.map(day => (
                    <option key={day.key} value={day.key}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div className="schedule-editor-form-row">
                <div className="schedule-editor-form-group">
                  <label>Hora Inicio</label>
                  <select
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                  >
                    {TIME_SLOTS.slice(0, -1).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                <div className="schedule-editor-form-group">
                  <label>Hora Fin</label>
                  <select
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                  >
                    {TIME_SLOTS.slice(1).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="schedule-editor-form-group">
                <label>Asignatura</label>
                {loadingData ? (
                  <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    Cargando asignaturas...
                  </div>
                ) : subjects.length === 0 ? (
                  <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    No hay asignaturas disponibles
                  </div>
                ) : (
                  <select
                    value={newBlock.subjectId}
                    onChange={(e) => {
                      const selectedSubject = subjects.find(s => s.id === e.target.value);
                      setNewBlock({ 
                        ...newBlock, 
                        subjectId: e.target.value,
                        subject: selectedSubject?.name || '',
                        color: selectedSubject?.color || newBlock.color
                      });
                    }}
                  >
                    <option value="">Selecciona una asignatura</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="schedule-editor-form-group">
                <label>{entityType === 'course' ? 'Profesor' : 'Curso'}</label>
                {loadingData ? (
                  <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    Cargando {entityType === 'course' ? 'profesores' : 'cursos'}...
                  </div>
                ) : entityType === 'course' ? (
                  teachers.length === 0 ? (
                    <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                      No hay profesores disponibles
                    </div>
                  ) : (
                    <select
                      value={newBlock.detailId}
                      onChange={(e) => {
                        const selectedTeacher = teachers.find(t => t.id === e.target.value);
                        setNewBlock({ 
                          ...newBlock, 
                          detailId: e.target.value,
                          detail: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : ''
                        });
                      }}
                    >
                      <option value="">Selecciona un profesor</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                          {teacher.specialization && ` - ${teacher.specialization}`}
                        </option>
                      ))}
                    </select>
                  )
                ) : (
                  courses.length === 0 ? (
                    <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                      No hay cursos disponibles
                    </div>
                  ) : (
                    <select
                      value={newBlock.detailId}
                      onChange={(e) => {
                        const selectedCourse = courses.find(c => c.id === e.target.value);
                        setNewBlock({ 
                          ...newBlock, 
                          detailId: e.target.value,
                          detail: selectedCourse?.name || ''
                        });
                      }}
                    >
                      <option value="">Selecciona un curso</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                          {course.studentCount && ` - ${course.studentCount} estudiantes`}
                        </option>
                      ))}
                    </select>
                  )
                )}
              </div>

              <div className="schedule-editor-form-group">
                <label>Color {newBlock.subjectId && '(color de la asignatura)'}</label>
                {newBlock.subjectId ? (
                  <div className="schedule-editor-color-preview">
                    <div 
                      className="schedule-editor-color-badge"
                      style={{ backgroundColor: newBlock.color }}
                    >
                      {subjects.find(s => s.id === newBlock.subjectId)?.name}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      El color se asigna automáticamente según la asignatura
                    </span>
                  </div>
                ) : (
                  <div className="schedule-editor-color-picker">
                    {PREDEFINED_COLORS.map(color => (
                      <button
                        key={color}
                        className={`schedule-editor-color-option ${newBlock.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewBlock({ ...newBlock, color })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="schedule-editor-modal-footer">
              <button onClick={() => setIsAddingBlock(false)} className="schedule-toolbar-btn">
                Cancelar
              </button>
              <button onClick={handleAddBlock} className="schedule-toolbar-btn primary">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de detalles del bloque seleccionado */}
      {selectedBlock && (
        <div className="schedule-editor-details-panel">
          <div className="schedule-editor-details-header">
            <h3>Detalles del Bloque</h3>
            <button onClick={() => setSelectedBlock(null)} className="schedule-editor-modal-close">
              ×
            </button>
          </div>
          <div className="schedule-editor-details-body">
            <div className="schedule-editor-details-item">
              <strong>Asignatura:</strong> {selectedBlock.subject}
            </div>
            <div className="schedule-editor-details-item">
              <strong>{entityType === 'course' ? 'Profesor' : 'Curso'}:</strong>{' '}
              {entityType === 'course' ? selectedBlock.teacher : selectedBlock.course}
            </div>
            <div className="schedule-editor-details-item">
              <strong>Horario:</strong> {selectedBlock.startTime} - {selectedBlock.endTime}
            </div>
            <div className="schedule-editor-details-item">
              <strong>Día:</strong> {DAYS.find(d => d.key === selectedBlock.day)?.label}
            </div>
          </div>
          <div className="schedule-editor-details-footer">
            <button
              onClick={() => handleDeleteBlock(selectedBlock.id)}
              className="schedule-toolbar-btn danger"
            >
              Eliminar Bloque
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
