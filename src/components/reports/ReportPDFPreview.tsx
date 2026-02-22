import { useRef, useState } from 'react';
import { FileText, Download, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CardiologueECG } from '@/stores/useCardiologueStore';

interface ReportPDFPreviewProps {
  ecg: CardiologueECG;
  cardiologistName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fmtDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtDateTime(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ReportPDFPreview({ ecg, cardiologistName, open, onOpenChange }: ReportPDFPreviewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const interp = ecg.interpretation;
  const m = ecg.measurements;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, Math.min(pdfH, pdf.internal.pageSize.getHeight()));
      pdf.save(`Rapport-${ecg.id}-${ecg.patientName.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      console.error('Erreur PDF :', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-4 pb-2 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-indigo-600" />
              Aperçu du rapport — {ecg.id}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" />Imprimer
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                Télécharger PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 bg-gray-100">
          {/* ──── RAPPORT A4 PAYSAGE ──── */}
          <div
            ref={reportRef}
            style={{
              width: '1122px',       /* A4 paysage 297mm × 210mm @ ~3.78px/mm */
              minHeight: '793px',
              background: '#ffffff',
              fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
              fontSize: '11px',
              lineHeight: '1.35',
              color: '#1e293b',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '4px',
              boxShadow: '0 4px 24px rgba(0,0,0,.12)',
            }}
          >
            {/* ── Bande supérieure décorative ── */}
            <div style={{
              height: '6px',
              background: 'linear-gradient(90deg, #4338ca 0%, #6366f1 40%, #06b6d4 100%)',
            }} />

            {/* ── EN-TÊTE ── */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '14px 28px 10px',
              borderBottom: '1px solid #e2e8f0',
            }}>
              {/* Logo Xpress-ECG */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px',
                }}>
                  X
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#4338ca', letterSpacing: '-0.3px' }}>
                    Xpress-ECG
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Plateforme de télé-interprétation ECG
                  </div>
                </div>
              </div>

              {/* Titre central */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '14px', fontWeight: 800, color: '#1e293b',
                  textTransform: 'uppercase', letterSpacing: '1.5px',
                }}>
                  Compte Rendu d'Interprétation ECG
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Réf. {ecg.id} • ECG du {fmtDate(ecg.ecgDate)}
                </div>
              </div>

              {/* Logo centre demandeur */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '6px',
                    background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '11px',
                  }}>
                    {ecg.hospital.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '10px', color: '#334155' }}>{ecg.hospital}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>{ecg.referringDoctor}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CORPS PRINCIPAL : 3 colonnes ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '195px 1fr 195px',
              gap: '0',
              minHeight: '620px',
            }}>

              {/* ▌ COLONNE GAUCHE : Patient + Mesures ▌ */}
              <div style={{
                padding: '14px 16px',
                borderRight: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {/* Patient */}
                <div>
                  <div style={{
                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px',
                  }}>Patient</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{ecg.patientName}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    {ecg.patientGender === 'M' ? 'Homme' : 'Femme'} — {ecg.patientAge} ans
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px', fontFamily: 'monospace' }}>
                    {ecg.patientId}
                  </div>
                </div>

                {/* Contexte clinique */}
                {ecg.clinicalContext && (
                  <div style={{
                    padding: '8px 10px', borderRadius: '6px',
                    background: '#fffbeb', borderLeft: '3px solid #f59e0b',
                  }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#92400e', marginBottom: '3px' }}>
                      Contexte clinique
                    </div>
                    <div style={{ fontSize: '10px', color: '#78350f', lineHeight: '1.4' }}>
                      {ecg.clinicalContext}
                    </div>
                  </div>
                )}

                {/* Urgence */}
                {ecg.urgency === 'urgent' && (
                  <div style={{
                    padding: '6px 10px', borderRadius: '6px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '10px', color: '#b91c1c', letterSpacing: '1px' }}>
                      ⚠ INTERPRÉTATION URGENTE
                    </span>
                  </div>
                )}

                {/* Mesures ECG */}
                <div>
                  <div style={{
                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px',
                  }}>Mesures ECG</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {[
                      { label: 'FC', value: m?.heartRate, unit: 'bpm', color: '#0369a1', bg: '#f0f9ff' },
                      { label: 'Rythme', value: m?.rhythm, unit: '', color: '#0369a1', bg: '#f0f9ff' },
                      { label: 'PR', value: m?.prInterval, unit: 'ms', color: '#15803d', bg: '#f0fdf4' },
                      { label: 'QRS', value: m?.qrsDuration, unit: 'ms', color: '#7e22ce', bg: '#fdf4ff' },
                      { label: 'QT', value: m?.qtInterval, unit: 'ms', color: '#b45309', bg: '#fffbeb' },
                      { label: 'QTc', value: m?.qtcInterval, unit: 'ms', color: '#b45309', bg: '#fffbeb' },
                    ].filter(x => x.value !== undefined && x.value !== null).map((item, i) => (
                      <div key={i} style={{
                        padding: '5px 7px', borderRadius: '4px', background: item.bg,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: item.color }}>
                          {item.value}
                        </div>
                        {item.unit && <div style={{ fontSize: '8px', color: '#94a3b8' }}>{item.unit}</div>}
                      </div>
                    ))}
                  </div>
                  {m?.axis && (
                    <div style={{
                      marginTop: '4px', padding: '5px 8px', borderRadius: '4px',
                      background: '#f8fafc', textAlign: 'center', border: '1px solid #e2e8f0',
                    }}>
                      <span style={{ fontSize: '9px', color: '#64748b' }}>Axe : </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>{m.axis}</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div style={{ marginTop: 'auto', fontSize: '9px', color: '#94a3b8', lineHeight: '1.6' }}>
                  <div>Reçu le {fmtDate(ecg.dateReceived)}</div>
                  <div>Interprété le {fmtDateTime(ecg.dateCompleted)}</div>
                </div>
              </div>

              {/* ▌ COLONNE CENTRALE : TRACÉ ECG (65-70% de la largeur) ▌ */}
              <div style={{
                padding: '14px',
                display: 'flex', flexDirection: 'column',
                background: '#fafbfc',
              }}>
                <div style={{
                  fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '1px', color: '#94a3b8', marginBottom: '8px',
                }}>Tracé Électrocardiographique</div>

                {/* Zone du tracé ECG */}
                <div style={{
                  flex: 1,
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '440px',
                }}>
                  {/* Grille ECG simulée */}
                  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.12 }}>
                    <defs>
                      <pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                        <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e74c3c" strokeWidth="0.3" />
                      </pattern>
                      <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                        <rect width="25" height="25" fill="url(#smallGrid)" />
                        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e74c3c" strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Tracé ECG simulé — 4 lignes de dérivations */}
                  <svg viewBox="0 0 700 450" width="100%" height="100%" style={{ position: 'relative', zIndex: 1 }}>
                    {[
                      { y: 56, label: 'DI', d: 'M0,56 L30,56 35,56 40,52 45,56 80,56 85,48 88,56 91,20 94,68 97,56 100,56 140,56 145,56 150,52 155,56 190,56 195,48 198,56 201,18 204,70 207,56 210,56 250,56 255,56 260,52 265,56 300,56 305,48 308,56 311,22 314,66 317,56 350,56' },
                      { y: 168, label: 'DII', d: 'M0,168 L30,168 35,168 40,162 45,168 80,168 85,158 88,168 91,125 94,182 97,168 100,168 140,168 145,168 150,162 155,168 190,168 195,158 198,168 201,122 204,185 207,168 210,168 250,168 255,168 260,162 265,168 300,168 305,158 308,168 311,128 314,180 317,168 350,168' },
                      { y: 280, label: 'V1', d: 'M0,280 L30,280 35,280 40,276 45,280 80,280 85,290 88,280 91,260 94,295 97,280 100,280 140,280 145,280 150,276 155,280 190,280 195,290 198,280 201,258 204,298 207,280 210,280 250,280 255,280 260,276 265,280 300,280 305,290 308,280 311,262 314,293 317,280 350,280' },
                      { y: 392, label: 'V5', d: 'M0,392 L30,392 35,392 40,388 45,392 80,392 85,382 88,392 91,350 94,405 97,392 100,392 140,392 145,392 150,388 155,392 190,392 195,382 198,392 201,348 204,408 207,392 210,392 250,392 255,392 260,388 265,392 300,392 305,382 308,392 311,352 314,404 317,392 350,392' },
                    ].map((trace, idx) => (
                      <g key={idx}>
                        <text x="4" y={trace.y - 22} fill="#6366f1" fontSize="10" fontWeight="700" fontFamily="monospace">{trace.label}</text>
                        <path d={trace.d} fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Répéter le pattern */}
                        <path d={trace.d.replace(/(\d+)/g, (_, n) => {
                          const num = parseInt(n);
                          return num <= 2 ? n : String(num + 350);
                        })} fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    ))}
                    {/* Marqueur calibration */}
                    <g>
                      <text x="660" y="440" fill="#94a3b8" fontSize="8" fontFamily="monospace">25mm/s | 10mm/mV</text>
                    </g>
                  </svg>

                  {/* Placeholder texte si pas d'image réelle */}
                  <div style={{
                    position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '8px', color: '#cbd5e1', letterSpacing: '0.5px',
                  }}>
                    [Tracé ECG original — emplacement pour l'image réelle]
                  </div>
                </div>
              </div>

              {/* ▌ COLONNE DROITE : Interprétation + Conclusion + Signature ▌ */}
              <div style={{
                padding: '14px 16px',
                borderLeft: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                {/* Constatations */}
                <div>
                  <div style={{
                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px',
                  }}>Constatations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {(interp?.findings ?? []).map((f, i) => (
                      <div key={i} style={{
                        fontSize: '10px', color: '#334155', paddingLeft: '10px',
                        borderLeft: `2px solid ${interp.isNormal ? '#22c55e' : '#f59e0b'}`,
                        lineHeight: '1.4',
                      }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusion */}
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: interp?.isNormal ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${interp?.isNormal ? '#86efac' : '#fca5a5'}`,
                }}>
                  <div style={{
                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: interp?.isNormal ? '#15803d' : '#b91c1c',
                    marginBottom: '4px',
                  }}>
                    {interp?.isNormal ? '✓ Conclusion — ECG normal' : '⚠ Conclusion — ECG anormal'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: interp?.isNormal ? '#166534' : '#991b1b',
                    lineHeight: '1.45',
                    fontWeight: 500,
                  }}>
                    {interp?.conclusion}
                  </div>
                </div>

                {/* Recommandations */}
                {interp?.recommendations && (
                  <div style={{
                    padding: '8px 10px', borderRadius: '6px',
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                  }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1d4ed8', marginBottom: '3px' }}>
                      Recommandations
                    </div>
                    <div style={{ fontSize: '10px', color: '#1e40af', lineHeight: '1.4' }}>
                      {interp.recommendations}
                    </div>
                  </div>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Signature électronique */}
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '10px',
                }}>
                  <div style={{
                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px',
                  }}>Signature électronique</div>
                  <div style={{
                    padding: '10px 12px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                      fontSize: '22px', color: '#1e3a5f', marginBottom: '4px',
                      borderBottom: '1px solid #cbd5e1', paddingBottom: '4px',
                    }}>
                      {cardiologistName}
                    </div>
                    <div style={{ fontSize: '9px', color: '#475569', fontWeight: 600 }}>
                      {cardiologistName}
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8' }}>
                      Cardiologue — Xpress-ECG
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>
                      Signé numériquement le {fmtDateTime(ecg.dateCompleted ?? new Date().toISOString())}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PIED DE PAGE ── */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 28px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '8px',
              color: '#94a3b8',
            }}>
              <span>Xpress-ECG — Plateforme de télé-interprétation ECG</span>
              <span>Document confidentiel — Usage médical exclusif — Ne pas diffuser</span>
              <span>Réf. {ecg.id} • Page 1/1</span>
            </div>

            {/* Bande inférieure */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, #4338ca 0%, #6366f1 40%, #06b6d4 100%)',
            }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
