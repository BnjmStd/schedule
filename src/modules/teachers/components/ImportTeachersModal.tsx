"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import "../../subjects/components/ImportSubjectsModal.css";

interface ImportTeachersModalProps {
  schoolId: string;
  onImport: (
    teachers: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      specialization?: string;
    }>,
  ) => void;
  onCancel: () => void;
}

export function ImportTeachersModal({
  schoolId,
  onImport,
  onCancel,
}: ImportTeachersModalProps) {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [previewData, setPreviewData] = useState<Array<any>>([]);
  const [error, setError] = useState("");

  const exampleData = [
    {
      Nombre: "Juan",
      Apellido: "Pérez",
      Email: "juan.perez@colegio.cl",
      Teléfono: "+56912345678",
      Especialización: "Matemáticas",
    },
    {
      Nombre: "María",
      Apellido: "González",
      Email: "maria.gonzalez@colegio.cl",
      Teléfono: "+56987654321",
      Especialización: "Lenguaje",
    },
    {
      Nombre: "Pedro",
      Apellido: "Silva",
      Email: "pedro.silva@colegio.cl",
      Teléfono: "+56911223344",
      Especialización: "Ciencias",
    },
  ];

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Profesores");

    // Añadir columnas
    worksheet.columns = [
      { header: "Nombre", key: "Nombre", width: 15 },
      { header: "Apellido", key: "Apellido", width: 15 },
      { header: "Email", key: "Email", width: 30 },
      { header: "Teléfono", key: "Teléfono", width: 15 },
      { header: "Especialización", key: "Especialización", width: 20 },
    ];

    // Añadir datos de ejemplo
    exampleData.forEach((row) => worksheet.addRow(row));

    // Generar y descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_profesores.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        setError("El archivo no contiene hojas");
        return;
      }

      const jsonData: any[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Primera fila son los headers
          row.eachCell((cell) => {
            headers.push(cell.value?.toString() || "");
          });
        } else {
          // Resto de filas son datos
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1]] = cell.value;
          });
          jsonData.push(rowData);
        }
      });

      if (jsonData.length === 0) {
        setError("El archivo está vacío");
        return;
      }

      // Validar columnas
      const firstRow: any = jsonData[0];
      const requiredColumns = ["Nombre", "Apellido", "Email"];
      const hasRequiredColumns = requiredColumns.every(
        (col) => col in firstRow,
      );

      if (!hasRequiredColumns) {
        setError(
          `El archivo debe tener las columnas: ${requiredColumns.join(", ")}`,
        );
        return;
      }

      setPreviewData(jsonData);
      setStep("preview");
      setError("");
    } catch (err) {
      setError(
        "Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.",
      );
    }
  };

  const handleImport = () => {
    const teachers = previewData
      .map((row: any) => ({
        firstName: row.Nombre || row.nombre || "",
        lastName: row.Apellido || row.apellido || "",
        email: row.Email || row.email || "",
        phone: row.Teléfono || row.telefono || row.phone || undefined,
        specialization:
          row.Especialización ||
          row.especializacion ||
          row.specialization ||
          undefined,
      }))
      .filter((t) => t.firstName && t.lastName && t.email);

    onImport(teachers);
  };

  return (
    <div className="import-modal">
      {step === "upload" && (
        <>
          <div className="import-header">
            <h3>📥 Importar Profesores desde Excel</h3>
            <p className="import-subtitle">
              Sube un archivo Excel con tus profesores o descarga la plantilla
            </p>
          </div>

          <div className="import-example">
            <h4>📋 Formato del archivo:</h4>
            <div className="example-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Especialización</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.Nombre}</td>
                      <td>{row.Apellido}</td>
                      <td>{row.Email}</td>
                      <td>{row.Teléfono}</td>
                      <td>{row.Especialización}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="import-note">
              * Las columnas <strong>Nombre</strong>, <strong>Apellido</strong>{" "}
              y <strong>Email</strong> son obligatorias
            </p>
          </div>

          <div className="import-actions">
            <button
              type="button"
              className="btn-download-template"
              onClick={downloadTemplate}
            >
              📥 Descargar Plantilla
            </button>

            <div className="file-upload-section">
              <label htmlFor="file-upload" className="btn-upload">
                📎 Seleccionar Archivo Excel
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {error && <div className="import-error">⚠️ {error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </>
      )}

      {step === "preview" && (
        <>
          <div className="import-header">
            <h3>👀 Vista Previa</h3>
            <p className="import-subtitle">
              Se importarán {previewData.length} profesores
            </p>
          </div>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Especialización</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row: any, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row.Nombre || row.nombre}</td>
                    <td>{row.Apellido || row.apellido}</td>
                    <td>{row.Email || row.email}</td>
                    <td>{row.Teléfono || row.telefono || row.phone || "-"}</td>
                    <td>
                      {row.Especialización ||
                        row.especializacion ||
                        row.specialization ||
                        "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setStep("upload")}
            >
              ← Volver
            </button>
            <button
              type="button"
              className="btn-confirm"
              onClick={handleImport}
            >
              ✓ Importar {previewData.length} Profesores
            </button>
          </div>
        </>
      )}
    </div>
  );
}
