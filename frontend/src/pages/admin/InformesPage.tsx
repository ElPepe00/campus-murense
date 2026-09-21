// frontend/src/pages/admin/InformesPage.tsx
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CalendarCheck, 
  CreditCard, 
  Download, 
  ChevronRight, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { fetchInscrits, fetchPagos, fetchAssistencia } from '../../api/campusApi';

export const InformesPage: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLlistatComplet = async () => {
    setExporting('inscrits');
    try {
      const data = await fetchInscrits();
      let csv = 'ID,Nom,Edat,Grup,DNI,Pagat,Present\n';
      data.forEach((d) => {
        csv += `${d.id},"${d.nom}",${d.edat},"${d.grup}","${d.dni}",${d.pagat ? 'SI' : 'NO'},${d.present ? 'SI' : 'NO'}\n`;
      });
      downloadCSV('llistat_inscrits_campus_murense.csv', csv);
      setDownloadSuccess('Llistat complet descarregat correctament!');
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const exportPagaments = async () => {
    setExporting('pagos');
    try {
      const data = await fetchPagos();
      let csv = 'ID,Nom,Grup,Import,Estat\n';
      data.llista.forEach((d) => {
        csv += `${d.id},"${d.nom}","${d.grup}","${d.import}","${d.estat}"\n`;
      });
      downloadCSV('informe_pagaments_campus_murense.csv', csv);
      setDownloadSuccess('Informe de pagaments descarregat!');
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const exportAssistencia = async () => {
    setExporting('assistencia');
    try {
      const data = await fetchAssistencia();
      let csv = 'Data,Nom,Grup,Present,Hora Entrada,Hora Sortida\n';
      data.registres.forEach((d) => {
        csv += `"${data.data}","${d.nom}","${d.grup}",${d.present ? 'PRESENT' : 'ABSENT'},"${d.horaEntrada}","${d.horaSortida}"\n`;
      });
      downloadCSV(`assistencia_campus_${data.data}.csv`, csv);
      setDownloadSuccess('Registre d’assistència descarregat!');
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="admin-page-container" style={{ maxWidth: '780px' }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Informes i Exportació</h1>
          <p className="admin-page-subtitle">Genera fitxers i llistats oficials del campus</p>
        </div>
      </div>

      {downloadSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          <CheckCircle2 size={18} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Opcions d'exportació de la Maqueta 7 */}
      <div className="menu-list" style={{ boxShadow: 'var(--shadow-card)', borderRadius: '16px' }}>
        <div 
          className="menu-item"
          onClick={exportLlistatComplet}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#eff6ff', color: '#0066f5' }}>
              <FileText size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Llistat complet</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Tots els nins i nines inscrits amb grups i edats</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#0066f5', fontWeight: 600 }}>
              {exporting === 'inscrits' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <ChevronRight size={18} className="menu-item-arrow" />
          </div>
        </div>

        <div 
          className="menu-item"
          onClick={exportAssistencia}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CalendarCheck size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Assistència</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Històric d'assistència per dates i grups</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
              {exporting === 'assistencia' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <ChevronRight size={18} className="menu-item-arrow" />
          </div>
        </div>

        <div 
          className="menu-item"
          onClick={exportPagaments}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Pagaments</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Estat de cobraments i justificants pendents</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>
              {exporting === 'pagos' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <ChevronRight size={18} className="menu-item-arrow" />
          </div>
        </div>

        <div 
          className="menu-item"
          onClick={exportLlistatComplet}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#f1f5f9', color: '#334155' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Exportar a Excel / CSV</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Descàrrega compatible amb Microsoft Excel i Google Sheets</p>
            </div>
          </div>
          <Download size={18} className="menu-item-arrow" style={{ color: '#0066f5' }} />
        </div>
      </div>
    </div>
  );
};
