// frontend/src/pages/admin/StudentsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  User, 
  Mail, 
  Share2, 
  Check 
} from 'lucide-react';
import { 
  fetchInscrits, 
  toggleEstatPago, 
  reenviarEmailConfirmacio, 
  type InscritListItem 
} from '../../api/campusApi';
import { getStoredCampusConfig, CAMPUS_SETMANES_DEF } from '../../utils/campusConfig';

interface StudentsPageProps {
  onSelectChild: (id: number) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onSelectChild }) => {
  const config = getStoredCampusConfig();
  const grupsOptions = ['Tots', ...config.grups.map((g) => g.nom)];

  const [inscrits, setInscrits] = useState<InscritListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrup, setSelectedGrup] = useState('Tots');
  const [selectedSetmana, setSelectedSetmana] = useState<string>('Totes');

  const [togglingPagoId, setTogglingPagoId] = useState<number | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchInscrits(search, selectedGrup === 'Tots' ? undefined : selectedGrup)
      .then((data) => setInscrits(data))
      .catch((err: unknown) => {
        console.error('Error carregant inscrits:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search, selectedGrup]);

  // Filtrar addicionalment per setmana si l'usuari ho demana
  const filteredInscrits = inscrits.filter((item) => {
    if (selectedSetmana === 'Totes') return true;
    return item.setmana === parseInt(selectedSetmana);
  });

  const handleTogglePago = async (e: React.MouseEvent, item: InscritListItem) => {
    e.stopPropagation();
    setTogglingPagoId(item.inscripcioId);
    try {
      await toggleEstatPago(item.inscripcioId);
      setInscrits((prev) =>
        prev.map((i) => (i.inscripcioId === item.inscripcioId ? { ...i, pagat: !i.pagat } : i))
      );
    } catch (err: unknown) {
      console.error('Error canviant estat de pagament:', err);
      alert("No s'ha pogut actualitzar l'estat del pagament.");
    } finally {
      setTogglingPagoId(null);
    }
  };

  const handleCopyEditLink = (e: React.MouseEvent, item: InscritListItem) => {
    e.stopPropagation();
    if (!item.editToken) return;
    const url = `${window.location.origin}/modificar-inscripcio?token=${item.editToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedTokenId(item.id);
      setTimeout(() => setCopiedTokenId(null), 2500);
    });
  };

  const handleResendEmail = async (e: React.MouseEvent, item: InscritListItem) => {
    e.stopPropagation();
    if (resendingEmailId) return;
    setResendingEmailId(item.inscripcioId);
    try {
      const res = await reenviarEmailConfirmacio(item.inscripcioId);
      alert(res.message || 'Correu de confirmació reenviat satisfactòriament!');
    } catch (err: unknown) {
      console.error('Error reenviant correu:', err);
      alert("Error en reenviar el correu. Revisa la configuració del servidor.");
    } finally {
      setResendingEmailId(null);
    }
  };

  const pagatsCount = filteredInscrits.filter((i) => i.pagat).length;
  const pendentsCount = filteredInscrits.filter((i) => !i.pagat).length;

  return (
    <div className="admin-page-container">
      {/* Capçalera amb mètriques ràpides consolidades */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestió Principal d'Inscrits</h1>
          <p className="admin-page-subtitle">
            Consolidat d'alumnes, setmanes contractades, dies de dinar i validació ràpida de pagaments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            Total: <strong>{filteredInscrits.length}</strong>
          </span>
          <span style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            Pagats: <strong>{pagatsCount}</strong>
          </span>
          <span style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            Pendents: <strong>{pendentsCount}</strong>
          </span>
        </div>
      </div>

      {/* Buscador i Filtres Consolidades */}
      <div className="table-controls-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ flex: '1 1 240px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cercar per nom de l'infant o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="group-tabs-filter" role="tablist">
          {grupsOptions.map((grup) => (
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

        {/* Filtre ràpid per Setmana */}
        <select
          className="form-select"
          style={{ width: 'auto', padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
          value={selectedSetmana}
          onChange={(e) => setSelectedSetmana(e.target.value)}
          aria-label="Filtrar per setmana"
        >
          <option value="Totes">Totes les setmanes</option>
          <option value="1">Setmana 1 (28/06 - 02/07)</option>
          <option value="2">Setmana 2 (05/07 - 09/07)</option>
          <option value="3">Setmana 3 (12/07 - 16/07)</option>
          <option value="4">Setmana 4 (19/07 - 23/07)</option>
        </select>
      </div>

      {/* Taula Consolidada d'Inscrits */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Carregant la llista d'alumnes...
          </div>
        ) : filteredInscrits.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No s'ha trobat cap alumne amb aquests criteris de cerca.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Jugador/a</th>
                  <th>Grup</th>
                  <th>Setmana</th>
                  <th>Servei Dinar</th>
                  <th>Total</th>
                  <th>Estat Pagament</th>
                  <th style={{ textAlign: 'right' }}>Accions Ràpides</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscrits.map((nen) => {
                  const weekInfo = CAMPUS_SETMANES_DEF.find((s) => s.num === nen.setmana);
                  return (
                    <tr 
                      key={nen.id} 
                      onClick={() => onSelectChild(nen.id)}
                      className="clickable-row"
                    >
                      {/* Jugador */}
                      <td>
                        <div className="child-cell-profile">
                          <div className="child-avatar-thumb">
                            <User size={18} />
                          </div>
                          <div>
                            <strong className="child-name">{nen.nom}</strong>
                            <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                              <span>DNI: {nen.dni}</span>
                              <span>•</span>
                              <span>{nen.edat} anys</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grup */}
                      <td>
                        <span className={`group-badge ${nen.grup.toLowerCase().replace(' ', '-')}`}>
                          {nen.grup}
                        </span>
                      </td>

                      {/* Setmana Contractada */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                            {weekInfo ? weekInfo.nom : `Setmana ${nen.setmana}`}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {weekInfo ? weekInfo.dates : 'Campus 2027'}
                          </span>
                        </div>
                      </td>

                      {/* Dinar per dies */}
                      <td>
                        {nen.dinarDiesTotal > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                              {nen.dinarDiesTotal} {nen.dinarDiesTotal === 1 ? 'dia' : 'dies'} ({nen.dinarDiesTotal * 8} €)
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sense dinar</span>
                        )}
                      </td>

                      {/* Preu Total */}
                      <td>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                          {nen.preuTotal?.toFixed(0) || 110} €
                        </strong>
                      </td>

                      {/* Pagament: clic ràpid per canviar entre Pagat i Pendent */}
                      <td>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePago(e, nen)}
                          disabled={togglingPagoId === nen.inscripcioId}
                          title="Fes clic per canviar l'estat de pagament"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                          }}
                        >
                          {nen.pagat ? (
                            <span className="status-badge success" style={{ cursor: 'pointer' }}>
                              <CheckCircle2 size={15} />
                              <span>Pagat</span>
                            </span>
                          ) : (
                            <span className="status-badge warning" style={{ cursor: 'pointer' }}>
                              <Clock size={15} />
                              <span>Pendent</span>
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Accions ràpides */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                          {/* Copiar enllaç familiar de modificació */}
                          {nen.editToken && (
                            <button
                              type="button"
                              className="btn-icon-view"
                              title={copiedTokenId === nen.id ? 'Enllaç copiat!' : "Copiar enllaç de modificació per a la família"}
                              onClick={(e) => handleCopyEditLink(e, nen)}
                              style={{ color: copiedTokenId === nen.id ? '#16a34a' : undefined }}
                            >
                              {copiedTokenId === nen.id ? <Check size={16} /> : <Share2 size={16} />}
                            </button>
                          )}

                          {/* Reenviar email de confirmació */}
                          <button
                            type="button"
                            className="btn-icon-view"
                            title="Reenviar correu de confirmació oficial al tutor"
                            onClick={(e) => handleResendEmail(e, nen)}
                            disabled={resendingEmailId === nen.inscripcioId}
                          >
                            <Mail size={16} />
                          </button>

                          {/* Veure fitxa */}
                          <button 
                            type="button" 
                            className="btn-icon-view"
                            title="Veure fitxa completa de l'alumne"
                            onClick={() => onSelectChild(nen.id)}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
