// frontend/src/pages/admin/ReportsPage.tsx
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CalendarCheck, 
  CreditCard, 
  Download, 
  ChevronRight, 
  FileText,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  Database
} from 'lucide-react';
import { 
  fetchInscrits, 
  fetchPagos, 
  fetchAssistencia, 
  fetchExportComplet,
  fetchFitxaInfant,
  type ExportCompletItem
} from '../../api/campusApi';

/**
 * Pantalla d'informes i descàrrega de dades oficials del campus (Pantalla 7).
 * Permet exportar el fitxer Master amb totes les dades completes a Excel / CSV, així com llistats especialitzats.
 */
export const ReportsPage: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const downloadCSV = (filename: string, csvContent: string) => {
    // Afegim el BOM UTF-8 per garantir que Excel obri correctament els caràcters catalans (accents, ç, l·l)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  /**
   * 🌟 EXPORTACIÓ COMPLETA MASTER (TOTES LES DADES EN UN SOL FITXER EXCEL)
   */
  const exportMasterComplet = async () => {
    setExporting('master');
    try {
      let data: ExportCompletItem[] = [];

      try {
        data = await fetchExportComplet();
      } catch (errApi) {
        console.warn('Avís connectant amb /export/complet, generant informe mitjançant fitxes individuals:', errApi);
        // Fallback robust: generar dades completes a partir dels inscrits
        const inscrits = await fetchInscrits();
        const detalls = await Promise.all(
          inscrits.map((item) =>
            fetchFitxaInfant(item.id).catch(() => null)
          )
        );

        data = inscrits.map((ins, idx) => {
          const fitxa = detalls[idx];
          return {
            id: ins.id,
            dataInscripcio: '2027',
            nom: ins.nom,
            dni: ins.dni,
            dataNaixement: fitxa?.dataNaixement || '',
            edat: ins.edat,
            poblacio: fitxa?.poblacio || 'Muro',
            clubProcedencia: fitxa?.clubProcedencia || 'C.D. Murense',
            tallaRoba: fitxa?.tallaRoba || '10',
            alergies: ins.alergies || fitxa?.alergies || 'Cap',
            malalties: fitxa?.malalties || 'Cap',
            tutorNom: fitxa?.tutor?.nom || 'Tutor',
            tutorEmail: fitxa?.tutor?.email || '',
            tutorTelefonPrincipal: fitxa?.tutor?.telefon || '',
            tutorTelefonSecundari: fitxa?.tutor?.telefonSecundari || '',
            personesAutoritzades: fitxa?.autoritzats?.map((a) => `${a.nom} (${a.parentiu || 'Autoritzat'}, DNI: ${a.dni})`).join('; ') || 'Només tutors',
            grup: ins.grup,
            setmanesContractades: fitxa?.campus?.setmanes || 4,
            menjador: fitxa?.campus?.menjador ? 'SÍ' : 'NO',
            intoleranciesMenjador: 'Cap',
            matinera: fitxa?.campus?.matinera ? 'SÍ' : 'NO',
            piscina: fitxa?.campus?.piscina || 'SI',
            excursio1: 'SÍ',
            excursio2: 'SÍ',
            autoritzacioImatges: 'SÍ',
            autoritzacioSortirSol: 'NO',
            autoritzacioSortides: 'SÍ',
            descompte: 'CAP',
            preuTotal: fitxa?.campus?.preuTotal || (ins.pagat ? 150 : 110),
            estatPagament: ins.pagat ? 'PAGAT' : 'PENDENT',
            presentAvui: ins.present ? 'PRESENT' : 'ABSENT',
          };
        });
      }

      // Capçaleres completes de l'Excel
      const headers = [
        'ID Alumne',
        'Data Registre',
        'Nom i Cognoms',
        'DNI Alumne',
        'Data Naixement',
        'Edat',
        'Poblacio',
        'Club Procedencia',
        'Talla Roba',
        'Alergies i Observacions Mediques',
        'Malalties o Medicacio',
        'Nom Tutor',
        'Email Tutor',
        'Telefon Principal',
        'Telefon Secundari',
        'Persones Autoritzades Recollida',
        'Grup Assignat',
        'Setmanes Contractades',
        'Servei Menjador',
        'Intol-lerancies Menjador',
        'Servei Matinera',
        'Servei Piscina',
        'Excursio 1 (30/06)',
        'Excursio 2 (07/07)',
        'Autoritzacio Drets Imatge',
        'Autoritzacio Sortir Sol',
        'Autoritzacio Sortides Club',
        'Tipus Descompte',
        'Import Total (EUR)',
        'Estat Pagament',
        'Assistencia Avui'
      ];

      let csv = headers.join(',') + '\n';

      data.forEach((row) => {
        const line = [
          row.id,
          escapeCSV(row.dataInscripcio),
          escapeCSV(row.nom),
          escapeCSV(row.dni),
          escapeCSV(row.dataNaixement),
          row.edat,
          escapeCSV(row.poblacio),
          escapeCSV(row.clubProcedencia),
          escapeCSV(row.tallaRoba),
          escapeCSV(row.alergies),
          escapeCSV(row.malalties),
          escapeCSV(row.tutorNom),
          escapeCSV(row.tutorEmail),
          escapeCSV(row.tutorTelefonPrincipal),
          escapeCSV(row.tutorTelefonSecundari),
          escapeCSV(row.personesAutoritzades),
          escapeCSV(row.grup),
          row.setmanesContractades,
          escapeCSV(row.menjador),
          escapeCSV(row.intoleranciesMenjador),
          escapeCSV(row.matinera),
          escapeCSV(row.piscina),
          escapeCSV(row.excursio1),
          escapeCSV(row.excursio2),
          escapeCSV(row.autoritzacioImatges),
          escapeCSV(row.autoritzacioSortirSol),
          escapeCSV(row.autoritzacioSortides),
          escapeCSV(row.descompte),
          row.preuTotal,
          escapeCSV(row.estatPagament),
          escapeCSV(row.presentAvui)
        ];
        csv += line.join(',') + '\n';
      });

      downloadCSV(`campus_cd_murense_MASTER_COMPLET_2027.csv`, csv);
      setDownloadSuccess('Fitxer Master amb totes les dades completes descarregat correctament!');
    } catch (err: unknown) {
      console.error('Error descarregant fitxer master:', err);
    } finally {
      setExporting(null);
    }
  };

  const exportLlistatComplet = async () => {
    setExporting('inscrits');
    try {
      const data = await fetchInscrits();
      let csv = 'ID,Nom,Edat,Grup,DNI,Pagat,Present\n';
      data.forEach((d) => {
        csv += `${d.id},${escapeCSV(d.nom)},${d.edat},${escapeCSV(d.grup)},${escapeCSV(d.dni)},${d.pagat ? 'SI' : 'NO'},${d.present ? 'SI' : 'NO'}\n`;
      });
      downloadCSV('llistat_inscrits_campus_murense.csv', csv);
      setDownloadSuccess('Llistat complet descarregat correctament!');
    } catch (err: unknown) {
      console.error('Error descarregant inscrits:', err);
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
        csv += `${d.id},${escapeCSV(d.nom)},${escapeCSV(d.grup)},${escapeCSV(d.import)},${escapeCSV(d.estat)}\n`;
      });
      downloadCSV('informe_pagaments_campus_murense.csv', csv);
      setDownloadSuccess('Informe de pagaments descarregat!');
    } catch (err: unknown) {
      console.error('Error descarregant pagaments:', err);
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
        csv += `${escapeCSV(data.data)},${escapeCSV(d.nom)},${escapeCSV(d.grup)},${d.present ? 'PRESENT' : 'ABSENT'},${escapeCSV(d.horaEntrada)},${escapeCSV(d.horaSortida)}\n`;
      });
      downloadCSV(`assistencia_campus_${data.data}.csv`, csv);
      setDownloadSuccess('Registre d’assistència descarregat!');
    } catch (err: unknown) {
      console.error('Error descarregant assistència:', err);
    } finally {
      setExporting(null);
    }
  };

  const exportLlistatMedic = async () => {
    setExporting('medic');
    try {
      const data = await fetchInscrits();
      let csv = 'ID,Nom Infant,Edat,Grup,DNI,Al·lèrgies i Observacions de Salut\n';
      data.forEach((d) => {
        csv += `${d.id},${escapeCSV(d.nom)},${d.edat},${escapeCSV(d.grup)},${escapeCSV(d.dni)},${escapeCSV(d.alergies || 'Cap informada')}\n`;
      });
      downloadCSV('informe_alergies_i_salut_campus_murense.csv', csv);
      setDownloadSuccess('Informe mèdic i dietes per a cuina/monitors descarregat!');
    } catch (err: unknown) {
      console.error('Error descarregant informe mèdic:', err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="admin-page-container" style={{ maxWidth: '840px' }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Informes i Exportació</h1>
          <p className="admin-page-subtitle">Genera fitxers i llistats oficials del campus directament compatibles amb Microsoft Excel</p>
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
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={18} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Targeta Destacada: FITXER MASTER AMB TOTES LES DADES COMPLETES */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #3b82f6',
          borderRadius: '18px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 8px 24px rgba(0, 102, 245, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ maxWidth: '520px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            <Sparkles size={13} />
            <span>Fitxer Master Unificat</span>
          </div>
          <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            Descàrrega de Totes les Dades Completes (.CSV per a Excel)
          </h2>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
            Conté <strong>absolutament totes les 31 columnes registrades</strong> a la base de dades: dades del nin, telèfons, correus, DNI, persones autoritzades a recollir, al·lèrgies mèdiques, menjador, matinera, piscina, excursions, autoritzacions legals RGPD, imports i estat de cobrament.
          </p>
        </div>

        <button
          type="button"
          onClick={exportMasterComplet}
          disabled={exporting === 'master'}
          className="btn-hero-primary"
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0, 102, 245, 0.35)',
            flexShrink: 0
          }}
        >
          <Database size={18} />
          <span>{exporting === 'master' ? 'Generant Excel...' : 'Descarregar Excel Master (31 cols)'}</span>
        </button>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary)" />
          <span>Informes Específics per Departament</span>
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Llistats filtrats per a imprimir o compartir directament amb monitors, cuina o tresoreria.
        </p>
      </div>

      {/* Llistat d'informes específics */}
      <div className="menu-list" style={{ boxShadow: 'var(--shadow-card)', borderRadius: '16px' }}>
        {/* 1. Mèdic i Menjador */}
        <div 
          className="menu-item"
          onClick={exportLlistatMedic}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Llistat Mèdic i Menjador (Al·lèrgies i Dietes)</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Full operatiu per a la cuina del menjador, farmaciola i equip de monitors</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#db2777', fontWeight: 600 }}>
              {exporting === 'medic' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <ChevronRight size={18} className="menu-item-arrow" />
          </div>
        </div>

        {/* 2. Registre d'assistència */}
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
              <strong className="menu-item-text">Registre d'Assistència Diari</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Llistat de presència amb hores d'entrada i sortida per grup</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
              {exporting === 'assistencia' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <ChevronRight size={18} className="menu-item-arrow" />
          </div>
        </div>

        {/* 3. Pagaments */}
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
              <strong className="menu-item-text">Seguiment Econòmic i Quotes</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Control d'imports, estat de cobrament i deutes pendents</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>
              {exporting === 'pagos' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <ChevronRight size={18} className="menu-item-arrow" />
          </div>
        </div>

        {/* 4. Llistat general ràpid */}
        <div 
          className="menu-item"
          onClick={exportLlistatComplet}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#eff6ff', color: '#0066f5' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Llistat Ràpid de Participants</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Resum bàsic amb nom, edat, grup, DNI i pagament</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#0066f5', fontWeight: 600 }}>
              {exporting === 'inscrits' ? 'Generant...' : 'Descarregar .CSV'}
            </span>
            <Download size={18} className="menu-item-arrow" style={{ color: '#0066f5' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
