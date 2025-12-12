/**
 * 🏫 Componente SchoolCard - Sistema de Horarios
 * 
 * Tarjeta para mostrar información de una escuela
 */

'use client';

import { School } from '@/types';
import { Card, CardContent, CardFooter, Button, Badge } from '@/components/ui';

export interface SchoolCardProps {
  school: School;
  onEdit?: (school: School) => void;
  onDelete?: (school: School) => void;
  onView?: (school: School) => void;
}

export function SchoolCard({ school, onEdit, onDelete, onView }: SchoolCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              {school.name}
            </h3>
            <div className="space-y-1 text-sm text-neutral-600">
              <p className="flex items-center gap-2">
                <span>📍</span>
                <span>{school.address}</span>
              </p>
              {school.phone && (
                <p className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{school.phone}</span>
                </p>
              )}
              {school.email && (
                <p className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>{school.email}</span>
                </p>
              )}
            </div>
          </div>
          <Badge variant="primary" size="sm">
            Activo
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 w-full">
          {onView && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onView(school)}
              className="flex-1"
            >
              Ver Detalles
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(school)}
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(school)}
              className="text-danger-600 hover:bg-danger-50"
            >
              Eliminar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
