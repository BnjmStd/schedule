/**
 * 🏫 Componente SchoolList - Sistema de Horarios
 * 
 * Lista de escuelas con búsqueda y filtros
 */

'use client';

import { useState } from 'react';
import { School } from '@/types';
import { SchoolCard } from './SchoolCard';
import { Input } from '@/components/ui';

export interface SchoolListProps {
  schools: School[];
  onEdit?: (school: School) => void;
  onDelete?: (school: School) => void;
  onView?: (school: School) => void;
}

export function SchoolList({ schools, onEdit, onDelete, onView }: SchoolListProps) {
  const [search, setSearch] = useState('');

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    school.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Buscar colegios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista de escuelas */}
      {filteredSchools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 text-lg">
            {search ? 'No se encontraron colegios' : 'No hay colegios registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
