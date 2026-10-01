// frontend/src/pages/admin/PaymentsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Search, 
  ArrowUpDown
} from 'lucide-react';
import { fetchPagos, toggleEstatPago, type PagosResponse } from '../../api/campusApi';

/**
 * Pantalla de control i gestió econòmica de quotes del campus (Pantalla 6).
 * Permet visualitzar l'estat de pagament de cada alumne i canviar ràpidament entre Pagat i Pendent.
 */
export const PaymentsPage: React.FC = () => {
  const [pagosData, setPagosData] = useState<PagosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TOTS' | 'PAGATS' | 'PENDENTS'>('TOTS');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const carregarPagos = () => {
    setLoading(true);
    fetchPagos()
      .then((data) => setPagosData(data))
      .catch((err: unknown) => {
        console.error('Error carregant pagaments:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarPagos();
  }, []);

  const handleTogglePago = async (id: number) => {
    setTogglingId(id);
    try {
      await toggleEstatPago(id);
      carregarPagos();
    } catch (err: unknown) {
      console.error('Error canviant estat pagament:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = (pagosData?.llista || []).filter((p) => {
    const matchesSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'TOTS' 
      ? true 
      : filterStatus === 'PAGATS' 
      ? p.estat === 'PAGAT' 
      : p.estat !== 'PAGAT';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-container">
      {/* Capçalera del mòdul */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Control de Pagaments i Quotes</h1>
          <p className="admin-page-subtitle">Seguiment econòmic i estat de cobraments del campus</p>
        </div>
      </div>

      {/* Targetes de resum (KPIs de pagament interactius) */}
      {pagosData && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div 
            className={`stat-card green ${filterStatus === 'PAGATS' ? 'active-filter-card' : ''}`} 
            style={{ cursor: 'pointer' }}
            onClick={() => setFilterStatus(filterStatus === 'PAGATS' ? 'TOTS' : 'PAGATS')}
            title="Filtrar només pagats"
          >
            <div className="stat-icon-box">
              <CheckCircle2 size={26} strokeWidth={2.2} />
            </div>
            <div className="stat-info-col">
              <span className="stat-value">{pagosData.pagats}</span>
              <span className="stat-title">Quotes Pagades</span>
            </div>
          </div>

          <div 
            className={`stat-card orange ${filterStatus === 'PENDENTS' ? 'active-filter-card' : ''}`} 
            style={{ cursor: 'pointer' }}
            onClick={() => setFilterStatus(filterStatus === 'PENDENTS' ? 'TOTS' : 'PENDENTS')}
            title="Filtrar només pendents"
          >
            <div className="stat-icon-box">
              <Clock size={26} strokeWidth={2.2} />
            </div>
            <div className="stat-info-col">
              <span className="stat-value">{pagosData.pendents}</span>
              <span className="stat-title">Quotes Pendents</span>
            </div>
          </div>

          <div 
            className={`stat-card blue ${filterStatus === 'TOTS' ? 'active-filter-card' : ''}`} 
            style={{ cursor: 'pointer' }}
            onClick={() => setFilterStatus('TOTS')}
            title="Veure tots els alumnes"
          >
            <div className="stat-icon-box">
              <Users size={26} strokeWidth={2.2} />
            </div>
            <div className="stat-info-col">
              <span className="stat-value">{pagosData.totalInscrits}</span>
              <span className="stat-title">Total Alumnes</span>
            </div>
          </div>
        </div>
      )}

      {/* Cerca per text de l'infant i filtre d'estat */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cercar pagament per nom de l'alumne..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="group-tabs-filter" role="tablist">
          <button
            type="button"
            className={`group-filter-pill ${filterStatus === 'TOTS' ? 'active' : ''}`}
            onClick={() => setFilterStatus('TOTS')}
          >
            Tots
          </button>
          <button
            type="button"
            className={`group-filter-pill ${filterStatus === 'PAGATS' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PAGATS')}
          >
            ✓ Pagats ({pagosData?.pagats || 0})
          </button>
          <button
            type="button"
            className={`group-filter-pill ${filterStatus === 'PENDENTS' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDENTS')}
          >
            ⏳ Pendents ({pagosData?.pendents || 0})
          </button>
        </div>
      </div>

      {/* Taula de pagaments */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Carregant dades de pagament...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No hi ha registres que coincideixin amb la cerca.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nom de l'infant</th>
                  <th>Grup</th>
                  <th>Import Total</th>
                  <th>Estat del Pagament</th>
                  <th style={{ textAlign: 'right' }}>Canviar Estat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="child-name">{item.nom}</strong>
                    </td>
                    <td>
                      <span className="group-badge">{item.grup}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.import}</span>
                    </td>
                    <td>
                      {item.estat === 'PAGAT' ? (
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
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-hero-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        disabled={togglingId === item.id}
                        onClick={() => handleTogglePago(item.id)}
                      >
                        <ArrowUpDown size={14} />
                        <span>{item.estat === 'PAGAT' ? 'Marcar Pendent' : 'Marcar Pagat'}</span>
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

export default PaymentsPage;
