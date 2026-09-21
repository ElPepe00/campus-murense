// frontend/src/pages/admin/InscritosPage.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle2, Clock, XCircle, ChevronRight, User } from 'lucide-react';
import { fetchInscrits, type InscritListItem } from '../../api/campusApi';

interface InscritosPageProps {
  onSelectChild: (id: number) => void;
  onNewInscripcion: () => void;
}

const GRUPS = ['Tots', 'Grup A', 'Grup B', 'Grup C'];

export const InscritosPage: React.FC<InscritosPageProps> = ({
  onSelectChild,
  onNewInscripcion,
}) => {
  const [inscrits, setInscrits] = useState<InscritListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrup, setSelectedGrup] = useState('Tots');

  useEffect(() => {
    loadData();
  }, [search, selectedGrup]);

  const loadData = () => {
    setLoading(true);
    fetchInscrits(search, selectedGrup === 'Tots' ? undefined : selectedGrup)
      .then((data) => setInscrits(data))
      .catch((err) => console.error('Error carregant inscrits:', err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="admin-page-container">
      {/* Header amb títol i botó d'alta */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Llistat d'Inscrits</h1>
          <p className="admin-page-subtitle">Gestió d'alumnes i grups del Campus d'Estiu</p>
        </div>
        <button
          type="button"
          className="btn-hero-primary"
          onClick={onNewInscripcion}
          style={{ padding: '10px 18px', fontSize: '14px' }}
        >
          <Plus size={18} />
          <span>Nova inscripció</span>
        </button>
      </div>

      {/* Buscador i Filtres de Grups */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar nin o nina per nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="group-tabs-filter" role="tablist">
          {GRUPS.map((grup) => (
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

      {/* Taula de l'estil de la Maqueta (Pantalla 3) */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Carregant alumnes...
          </div>
        ) : inscrits.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No s'ha trobat cap alumne amb aquests criteris de cerca.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nom de l'infant</th>
                  <th>Edat</th>
                  <th>Grup</th>
                  <th>Pagament</th>
                  <th>Assistència Avui</th>
                  <th style={{ textAlign: 'right' }}>Acció</th>
                </tr>
              </thead>
              <tbody>
                {inscrits.map((nen) => (
                  <tr 
                    key={nen.id} 
                    onClick={() => onSelectChild(nen.id)}
                    className="clickable-row"
                  >
                    <td>
                      <div className="child-cell-profile">
                        <div className="child-avatar-thumb">
                          <User size={18} />
                        </div>
                        <div>
                          <strong className="child-name">{nen.nom}</strong>
                          <span className="child-dni">DNI: {nen.dni}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="child-age">{nen.edat} anys</span>
                    </td>
                    <td>
                      <span className={`group-badge ${nen.grup.toLowerCase().replace(' ', '-')}`}>
                        {nen.grup}
                      </span>
                    </td>
                    <td>
                      {nen.pagat ? (
                        <span className="status-badge success">
                          <CheckCircle2 size={15} />
                          <span>Pagat</span>
                        </span>
                      ) : (
                        <span className="status-badge warning">
                          <Clock size={15} />
                          <span>Pendent</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {nen.present ? (
                        <span className="status-badge success">
                          <CheckCircle2 size={15} />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="status-badge danger">
                          <XCircle size={15} />
                          <span>Absent</span>
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        className="btn-icon-view"
                        title="Veure fitxa completa"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
