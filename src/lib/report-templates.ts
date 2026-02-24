import type { Tables } from './database.types';
import type { ECGAnalysisResult } from './ecg-analysis';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  footer?: string;
  logo?: string;
}

export interface ReportSection {
  id: string;
  type: 'header' | 'patient-info' | 'measurements' | 'ecg-image' | 'analysis' | 'signature';
  title?: string;
  fields?: string[];
  layout?: 'single-column' | 'two-columns' | 'three-columns';
  style?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
  };
}

export const defaultTemplate: ReportTemplate = {
  id: 'default',
  name: 'Rapport Standard',
  description: 'Template de rapport ECG standard',
  sections: [
    {
      id: 'header',
      type: 'header',
      style: {
        fontSize: '24px',
        color: '#1a1a1a'
      }
    },
    {
      id: 'patient-info',
      type: 'patient-info',
      title: 'Information Patient',
      fields: ['name', 'id', 'gender', 'age', 'date'],
      layout: 'two-columns'
    },
    {
      id: 'measurements',
      type: 'measurements',
      title: 'Mesures',
      fields: [
        'heartRate',
        'prInterval',
        'qrsInterval',
        'qtInterval'
      ],
      layout: 'three-columns'
    },
    {
      id: 'ecg-image',
      type: 'ecg-image'
    },
    {
      id: 'analysis',
      type: 'analysis',
      title: 'Analyse'
    },
    {
      id: 'signature',
      type: 'signature'
    }
  ],
  footer: '© Xpress-ECG {{year}}'
};

export interface ReportData {
  ecgRecord: Tables['ecg_records']['Row'];
  analysis: ECGAnalysisResult;
  doctor: {
    name: string;
    title: string;
    signature?: string;
  };
  hospital: {
    name: string;
    logo?: string;
  };
}

export async function generateReport(template: ReportTemplate, _data: ReportData) {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Generate report content
  const content = document.createElement('div');
  content.className = 'report-content';

  for (const section of template.sections) {
    const sectionElement = document.createElement('div');
    sectionElement.className = `report-section report-section-${section.type}`;

    switch (section.type) {
      case 'header':
        // Add header content
        break;
      case 'patient-info':
        // Add patient info content
        break;
      case 'measurements':
        // Add measurements content
        break;
      case 'ecg-image':
        // Add ECG image
        break;
      case 'analysis':
        // Add analysis content
        break;
      case 'signature':
        // Add signature content
        break;
    }

    content.appendChild(sectionElement);
  }

  // Convert content to canvas
  const canvas = await (html2canvas as (el: HTMLElement) => Promise<HTMLCanvasElement>)(content);
  const imgData = canvas.toDataURL('image/png');

  // Add to PDF
  doc.addImage(imgData, 'PNG', 0, 0, 210, 297);

  return doc;
}