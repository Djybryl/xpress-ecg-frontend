import { useEffect, useRef } from 'react';
import type { ReportTemplate, ReportData } from '@/lib/report-templates';

interface ReportPreviewProps {
  template: ReportTemplate;
  data: ReportData;
}

export function ReportPreview({ template, data }: ReportPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Générer le contenu du rapport en fonction du template
    const content = document.createElement('div');
    content.className = 'report-content';

    template.sections.forEach(section => {
      const sectionElement = document.createElement('div');
      sectionElement.className = `report-section report-section-${section.type}`;

      switch (section.type) {
        case 'header':
          sectionElement.innerHTML = `
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">${data.hospital.name}</h1>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Date: ${new Date().toLocaleDateString()}</p>
                <p class="text-sm text-gray-600">Réf: ${data.ecgRecord.id}</p>
              </div>
            </div>
          `;
          break;

        case 'patient-info':
          sectionElement.innerHTML = `
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2">${section.title}</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Nom du patient</p>
                  <p class="font-medium">${data.ecgRecord.patient_name}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Genre</p>
                  <p class="font-medium">${data.ecgRecord.gender || '-'}</p>
                </div>
              </div>
            </div>
          `;
          break;

        case 'measurements':
          sectionElement.innerHTML = `
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2">${section.title}</h2>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Fréquence cardiaque</p>
                  <p class="font-medium">${data.analysis.heartRate || '-'} bpm</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Intervalle PR</p>
                  <p class="font-medium">${data.analysis.prInterval || '-'} ms</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">QT/QTc</p>
                  <p class="font-medium">${data.analysis.qtInterval || '-'} ms</p>
                </div>
              </div>
            </div>
          `;
          break;

        case 'analysis':
          sectionElement.innerHTML = `
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2">${section.title}</h2>
              <p class="whitespace-pre-line">${data.analysis.diagnosis || 'Aucune analyse disponible.'}</p>
            </div>
          `;
          break;

        case 'signature':
          sectionElement.innerHTML = `
            <div class="mt-12 flex justify-end">
              <div class="text-right">
                <p class="font-medium">${data.doctor.name}</p>
                <p class="text-sm text-gray-600">${data.doctor.title}</p>
              </div>
            </div>
          `;
          break;
      }

      content.appendChild(sectionElement);
    });

    // Ajouter le pied de page
    if (template.footer) {
      const footer = document.createElement('div');
      footer.className = 'mt-8 pt-4 border-t text-sm text-gray-500 text-center';
      footer.textContent = template.footer.replace('{{year}}', new Date().getFullYear().toString());
      content.appendChild(footer);
    }

    // Remplacer le contenu existant
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(content);
  }, [template, data]);

  return (
    <div
      ref={containerRef}
      className="bg-white p-8 shadow-lg min-h-[297mm] w-[210mm] mx-auto"
    />
  );
}