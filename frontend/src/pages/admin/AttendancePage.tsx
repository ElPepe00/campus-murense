// frontend/src/pages/admin/AttendancePage.tsx
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search, 
  Save, 
  Check, 
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  fetchAssistencia, 
  updateAssistencia, 
  type AssistenciaResponse 
} from '../../api/campusApi';

const GRUPS_OPTIONS = ['Tots', 'Grup A', 'Grup B', 'Grup C'];

/**
 * Pantalla d'assistència diària per a monitors i coordinació esportiva (Pantalla 5).
 * Permet navegar entre dates, veure el recompte de presents/absents i marcar l'assistència a l'instant.
 */
export const AttendancePage: React.FC = () => {
  const [dataSeleccionada, setDataSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [assistencia, setAssistencia] = useState<AssistenciaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrup, setSelectedGrup] = useState('Tots');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    carregarAssistencia(dataSeleccionada);
  }, [dataSeleccionada]);

  const carregarAssistencia = (d: string) => {
    setLoading(true);
    fetchAssistencia(d)
      .then((res) => setAssistencia(res))
      .catch((err: unknown) => {
        console.error('Error carregant assistència:', err);
      })
      .finally(() => setLoading(false));
  };

  const handlePrevDay = () => {
    const d = new Date(dataSeleccionada);
    d.setDate(d.getDate() - 1);
    setDataSeleccionada(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(dataSeleccionada);
    d.setDate(d.getDate() + 1);
    setDataSeleccionada(d.toISOString().split('T')[0]);
  };

  const togglePresent = async (jugadorId: number, currentPresent: boolean) => {
    const nouPresent = !currentPresent;

    // Actualització optimista de l'estat local
    setAssistencia((prev) => {
      if (!prev) return prev;
      const nousRegistres = prev.registres.map((r) => {
        if (r.jugadorId === jugadorId) {
          const ara = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...r,
            present: nouPresent,
            horaEntrada: nouPresent ? (r.horaEntrada !== '--' ? r.horaEntrada : ara) : '--',
            horaSortida: nouPresent ? r.horaSortida : '--',
          };
        }
        return r;
      });

      const presents = nousRegistres.filter((r) => r.present).length;
      const absents = nousRegistres.length - presents;

      return {
        ...prev,
        presentes: presents,
        ausentes: absents,
        registres: nousRegistres,
      };
    });

    try {
      await updateAssistencia(jugadorId, dataSeleccionada, nouPresent);
    } catch (err: unknown) {
      console.error('Error guardant assistència:', err);
      // Revertir dades en cas d'error de xarxa
      carregarAssistencia(dataSeleccionada);
    }
  };

  // Filtrar registres tant per nom/text de cerca com per grup seleccionat
  const filteredList = (assistencia?.registres || []).filter((r) => {
    const matchesSearch = r.nom.toLowerCase().includes(search.toLowerCase());
    const matchesGrup = selectedGrup === 'Tots' || r.grup === selectedGrup;
    return matchesSearch && matchesGrup;
  });

  // Recompte dinàmic per al grup seleccionat
  const groupRegistres = selectedGrup === 'Tots'
    ? (assistencia?.registres || [])
    : (assistencia?.registres || []).filter((r) => r.grup === selectedGrup);

  const statsPresents = groupRegistres.filter((r) => r.present).length;
  const statsAbsents = groupRegistres.length - statsPresents;
  const statsTotal = groupRegistres.length;

  return (
    <div className="admin-page-container">
      {/* Capçalera del mòdul */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Control d'Assistència Diària</h1>
          <p className="admin-page-subtitle">Passe de llista ràpid per a monitors i coordinació</p>
        </div>
      </div>

      {/* Selector de Data amb Fletxes de Navegació */}
      <div className="date-picker-card">
        <button type="button" className="btn-date-nav" onClick={handlePrevDay} title="Dia anterior">
          <ChevronLeft size={20} />
        </button>

        <div className="date-current-label">
          <Calendar size={18} color="#0066f5" />
          <span>
            {new Date(dataSeleccionada).toLocaleDateString('ca-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        <button type="button" className="btn-date-nav" onClick={handleNextDay} title="Dia següent">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Targetes de resum (Presents / Absents / Total) */}
      {assistencia && (
        <div className="attendance-summary-grid">
          <div className="attendance-kpi green">
            <span className="attendance-kpi-num">{statsPresents}</span>
            <span className="attendance-kpi-label">Presents {selectedGrup !== 'Tots' ? `(${selectedGrup})` : ''}</span>
          </div>

          <div className="attendance-kpi red">
            <span className="attendance-kpi-num">{statsAbsents}</span>
            <span className="attendance-kpi-label">Absents {selectedGrup !== 'Tots' ? `(${selectedGrup})` : ''}</span>
          </div>

          <div className="attendance-kpi gray">
            <span className="attendance-kpi-num">{statsTotal}</span>
            <span className="attendance-kpi-label">Total {selectedGrup === 'Tots' ? 'Inscripcions' : selectedGrup}</span>
          </div>
        </div>
      )}

      {/* Cerca per text de l'infant i Filtre per Grup */}
      <div className="table-controls-bar" style={{ marginTop: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cercar infant a la llista d'avui..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="group-tabs-filter" role="tablist" aria-label="Filtrar per grup">
          {GRUPS_OPTIONS.map((grup) => (
            <button
              key={grup}
              type="button"
              className={`group-filter-pill ${selectedGrup === grup ? 'active' : ''}`}
              onClick={() => setSelectedGrup(grup)}
            >
              {grup}
            </button>
          ))}
        </div>
      </div>

      {/* Taula interactiva d'assistència */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Carregant assistència...
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No hi ha alumnes que coincideixin amb la cerca.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>Check</th>
                  <th>Infant / Alumne</th>
                  <th>Grup</th>
                  <th>Hora Entrada</th>
                  <th>Hora Sortida</th>
                  <th>Estat</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((nen) => (
                  <tr 
                    key={nen.jugadorId}
                    className={`attendance-row ${nen.present ? 'row-present' : ''}`}
                    onClick={() => togglePresent(nen.jugadorId, nen.present)}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className={`checkbox-custom ${nen.present ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePresent(nen.jugadorId, nen.present);
                        }}
                        aria-label={`Marcar assistència per a ${nen.nom}`}
                      >
                        {nen.present && <Check size={16} strokeWidth={3} />}
                      </button>
                    </td>
                    <td>
                      <div className="child-cell-profile">
                        <div className="child-avatar-thumb" style={{ background: nen.present ? '#eff6ff' : '#f1f5f9' }}>
                          <User size={18} color={nen.present ? '#0066f5' : '#94a3b8'} />
                        </div>
                        <strong className="child-name">{nen.nom}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`group-badge ${nen.grup.toLowerCase().replace(' ', '-')}`}>{nen.grup}</span>
                    </td>
                    <td>
                      <span className="time-pill">
                        <Clock size={13} />
                        {nen.horaEntrada}
                      </span>
                    </td>
                    <td>
                      <span className="time-pill">
                        <Clock size={13} />
                        {nen.horaSortida}
                      </span>
                    </td>
                    <td>
                      {nen.present ? (
                        <span className="status-badge success">Present</span>
                      ) : (
                        <span className="status-badge danger">Absent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botó de desar canvis */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {savedSuccess && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '14px' }}>
            <Sparkles size={16} />
            Assistència guardada correctament!
          </span>
        )}
        <button
          type="button"
          className="btn-hero-primary"
          onClick={() => {
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
          }}
        >
          <Save size={18} />
          <span>Guardar assistència</span>
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
