"use client";

import { useEffect, useState } from "react";
import { getSchools, deleteSchool } from "@/modules/schools/actions";
import {
  SchoolList,
  AddSchoolButton,
  AcademicLevelScheduleConfig,
} from "@/modules/schools/components";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useModal } from "@/contexts/ModalContext";
import type { School } from "@/types";
import styles from "./schools.module.css";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    const schoolsData = await getSchools();
    setSchools(schoolsData);
    setIsLoading(false);
  };

  const handleDeleteSchool = (school: School) => {
    openModal(
      <ConfirmDialog
        title="¿Eliminar colegio?"
        message={`¿Estás seguro de que quieres eliminar ${school.name}? Todos los profesores, cursos y horarios asociados también se eliminarán. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          try {
            const success = await deleteSchool(school.id);
            if (success) {
              setSchools(schools.filter((s) => s.id !== school.id));
              closeModal();
            } else {
              alert("Error al eliminar el colegio");
            }
          } catch (error) {
            console.error("Error al eliminar colegio:", error);
            alert("Error al eliminar el colegio");
          }
        }}
        onCancel={closeModal}
      />,
      "⚠️ Confirmar eliminación",
    );
  };

  if (isLoading) {
    return (
      <div className={styles["schools-page"]}>
        <div className={styles["schools-bg"]}>
          <div className={styles["schools-gradient"]} />
        </div>
        <div className={styles["schools-container"]}>
          <div className={styles["schools-empty"]}>
            <div className={styles["schools-empty-icon"]}>⏳</div>
            <p className={styles["schools-empty-title"]}>
              Cargando colegios...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["schools-page"]}>
      <div className={styles["schools-bg"]}>
        <div className={styles["schools-gradient"]} />
      </div>

      <div className={styles["schools-container"]}>
        <header className={styles["schools-header"]}>
          <div className={styles["schools-header-top"]}>
            <h1 className={styles["schools-title"]}>🏫 Colegios</h1>
            <AddSchoolButton onSchoolCreated={loadSchools} />
          </div>
          <p className={styles["schools-description"]}>
            Gestiona los colegios registrados en el sistema. Cada colegio puede
            tener múltiples profesores, cursos y horarios.
          </p>
        </header>

        <SchoolList
          schools={schools}
          onDelete={handleDeleteSchool}
          onConfigSchedule={(school) => setSelectedSchool(school)}
        />
      </div>

      {/* Modal de configuración de jornada */}
      {selectedSchool && (
        <AcademicLevelScheduleConfig
          schoolId={selectedSchool.id}
          schoolName={selectedSchool.name}
          onClose={() => setSelectedSchool(null)}
        />
      )}
    </div>
  );
}
