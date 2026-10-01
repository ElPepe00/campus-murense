// frontend/src/pages/admin/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  UserCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Waves, 
  MapPin, 
  Sparkles,
  CreditCard,
  Calendar,
  Save,
  RotateCcw,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStoredCampusConfig, 
  setStoredCampusConfig, 
  DEFAULT_CAMPUS_CONFIG,
  type CampusConfigData, 
  type CampusGroupConfig,
  type SetmanaConfig
} from '../../utils/campusConfig';
import { fetchCampusConfig, saveCampusConfigToApi } from '../../api/campusApi';

type SettingsTabKey = 'tarifes' | 'grups' | 'banc' | 'calendari' | 'instalacions';

export const SettingsPage: React.FC = () => {
  const { usuari } = useAuth();
  const [config, setConfig] = useState<CampusConfigData>(getStoredCampusConfig());
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('tarifes');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estat per a edició de grups
  const [editingGroup, setEditingGroup] = useState<CampusGroupConfig | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Form de grup
  const [formNom, setFormNom] = useState('');
  const [formSubtitol, setFormSubtitol] = useState('');
  const [formEdats, setFormEdats] = useState('');
  const [formColor, setFormColor] = useState('#1d4ed8');
  const [formPlaces, setFormPlaces] = useState<number>(25);
  const [formRatio, setFormRatio] = useState('1 monitor / 10 nins');
  const [formPreu, setFormPreu] = useState<number>(40);
  const [formMenjador, setFormMenjador] = useState<number>(25);
  const [formMatinera, setFormMatinera] = useState<number>(10);
  const [formDescompte, setFormDescompte] = useState<number>(10);
  const [formZona, setFormZona] = useState('Camp F7 Principal');
  const [formPiscina, setFormPiscina] = useState('12:00h a 13:00h');
  const [formPilota, setFormPilota] = useState('Talla 4');

  // Intentar sincronitzar des de l'API en carregar la pàgina
  useEffect(() => {
    fetchCampusConfig()
      .then((res) => {
        if (res.status === 'ok' && res.data && typeof res.data === 'object') {
          const apiConfig = res.data as CampusConfigData;
          setConfig((prev) => {
            const merged = { ...prev, ...apiConfig };
            setStoredCampusConfig(merged);
            return merged;
          });
        }
      })
      .catch((err) => {
        console.info('Configuració carregada des de memòria local:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAllConfig = async () => {
    setSaving(true);
    try {
      // 1. Desar a la memòria local per a resposta instantània i components reactius
      setStoredCampusConfig(config);

      // 2. Intentar desar a la base de dades del backend
      try {
        await saveCampusConfigToApi(config);
      } catch (apiErr) {
        console.warn('Avís desant al backend (mode local actiu):', apiErr);
      }

      showToast('Configuració desada correctament! Els canvis ja són visibles al formulari.');
    } catch (e) {
      console.error('Error desant configuració:', e);
      showToast('S\'ha produït un error en desar la configuració.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Vols restablir tots els paràmetres, preus i grups als valors per defecte?')) {
      setConfig(DEFAULT_CAMPUS_CONFIG);
      setStoredCampusConfig(DEFAULT_CAMPUS_CONFIG);
      saveCampusConfigToApi(DEFAULT_CAMPUS_CONFIG).catch(() => {});
      showToast('Paràmetres restablerts als valors originals.');
    }
  };

  // --- Handlers per als Grups ---
  const handleOpenNewGroup = () => {
    setEditingGroup(null);
    setFormNom(`Grup ${String.fromCharCode(65 + config.grups.length)}`);
    setFormSubtitol('Nova categoria');
    setFormEdats('7 a 9 anys');
    setFormColor('#7c3aed');
    setFormPlaces(25);
    setFormRatio('1 monitor / 10 nins');
    setFormPreu(40);
    setFormMenjador(25);
    setFormMatinera(10);
    setFormDescompte(10);
    setFormZona('Camp F7 B');
    setFormPiscina('12:00h a 13:00h');
    setFormPilota('Talla 4');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (grup: CampusGroupConfig) => {
    setEditingGroup(grup);
    setFormNom(grup.nom);
    setFormSubtitol(grup.subtitol);
    setFormEdats(grup.edats);
    setFormColor(grup.color);
    setFormPlaces(grup.placesMaximes);
    setFormRatio(grup.ratioMonitor);
    setFormPreu(grup.preuSetmana);
    setFormMenjador(grup.preuMenjadorSetmana);
    setFormMatinera(grup.preuMatineraSetmana);
    setFormDescompte(grup.descompteGermansPercent);
    setFormZona(grup.zonaEntrenament);
    setFormPiscina(grup.tornPiscina);
    setFormPilota(grup.pilotaRecomanada);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroupModal = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedGroupData: CampusGroupConfig = {
      id: editingGroup ? editingGroup.id : `grup-${Date.now()}`,
      nom: formNom.trim() || 'Grup',
      subtitol: formSubtitol.trim() || 'Sense descripció',
      edats: formEdats.trim() || 'Edats pendents',
      color: formColor,
      placesMaximes: Number(formPlaces) || 25,
      ratioMonitor: formRatio.trim() || '1 / 10',
      preuSetmana: Number(formPreu) || 40,
      preuMenjadorSetmana: Number(formMenjador) || 25,
      preuMatineraSetmana: Number(formMatinera) || 10,
      descompteGermansPercent: Number(formDescompte) || 0,
      zonaEntrenament: formZona.trim() || 'Camp de futbol',
      tornPiscina: formPiscina.trim() || 'Sense torn',
      pilotaRecomanada: formPilota.trim() || 'Talla 4',
    };

    let newGrups: CampusGroupConfig[];
    if (editingGroup) {
      newGrups = config.grups.map((g) => (g.id === editingGroup.id ? updatedGroupData : g));
    } else {
      newGrups = [...config.grups, updatedGroupData];
    }

    const updatedConfig = { ...config, grups: newGrups };
    setConfig(updatedConfig);
    setStoredCampusConfig(updatedConfig);
    saveCampusConfigToApi(updatedConfig).catch(() => {});
    setIsGroupModalOpen(false);
    showToast(`Grup ${updatedGroupData.nom} guardat correctament.`);
  };

  const handleDeleteGroup = (id: string, nom: string) => {
    if (window.confirm(`Segur que vols eliminar ${nom} i les seves configuracions?`)) {
      const newGrups = config.grups.filter((g) => g.id !== id);
      const updatedConfig = { ...config, grups: newGrups };
      setConfig(updatedConfig);
      setStoredCampusConfig(updatedConfig);
      saveCampusConfigToApi(updatedConfig).catch(() => {});
      showToast(`S'ha eliminat ${nom}`);
    }
  };

  const handleWeekChange = (index: number, field: keyof SetmanaConfig, value: string) => {
    const updatedWeeks = [...config.calendari.setmanes];
    updatedWeeks[index] = {
      ...updatedWeeks[index],
      [field]: value,
    };
    setConfig({
      ...config,
      calendari: {
        ...config.calendari,
        setmanes: updatedWeeks,
      },
    });
  };

  return (
    <div className="admin-page-container" style={{ maxWidth: '1000px' }}>
      {/* Capçalera */}
      <div className="admin-page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="admin-page-title">Configuració i Gestió del Club</h1>
          <p className="admin-page-subtitle">
            Control de tarifes, dates, dades bancàries i grups d'edat. Coordinador actiu: <strong>{usuari?.nom_complet || 'Staff C.D. Murense'}</strong> ({usuari?.email || 'admin@cdmurense.com'})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-topbar-ghost"
            onClick={handleResetDefaults}
            title="Restablir valors inicials"
            style={{ fontSize: '13px' }}
          >
            <RotateCcw size={15} />
            <span>Restablir defecte</span>
          </button>

          <button
            type="button"
            className="btn-hero-primary"
            onClick={handleSaveAllConfig}
            disabled={saving}
            style={{ fontSize: '13.5px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Guardant...' : 'Desar canvis'}</span>
          </button>
        </div>
      </div>

      {/* Missatge Toast de Confirmació */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Pestanyes de Configuració */}
      <div className="group-tabs-filter" style={{ marginBottom: '24px', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <button
          type="button"
          className={`group-filter-pill ${activeTab === 'tarifes' ? 'active' : ''}`}
          onClick={() => setActiveTab('tarifes')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Coins size={16} />
          <span>Tarifes i Quotes</span>
        </button>

        <button
          type="button"
          className={`group-filter-pill ${activeTab === 'grups' ? 'active' : ''}`}
          onClick={() => setActiveTab('grups')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={16} />
          <span>Grups i Places ({config.grups.length})</span>
        </button>

        <button
          type="button"
          className={`group-filter-pill ${activeTab === 'banc' ? 'active' : ''}`}
          onClick={() => setActiveTab('banc')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CreditCard size={16} />
          <span>Dades Bancàries i Pagament</span>
        </button>

        <button
          type="button"
          className={`group-filter-pill ${activeTab === 'calendari' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendari')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Calendar size={16} />
          <span>Calendari i Torns</span>
        </button>

        <button
          type="button"
          className={`group-filter-pill ${activeTab === 'instalacions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instalacions')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Building size={16} />
          <span>Horaris i Contacte</span>
        </button>
      </div>

      {/* CONTINGUT DE LA PESTANYA 1: TARIFES I PREUS */}
      {activeTab === 'tarifes' && (
        <div className="data-table-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={20} color="var(--primary)" />
              <span>Quotes Oficials del Campus (Escala de Preus)</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Aquests preus s'apliquen directament al formulari d'inscripció que completen les famílies.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>1 Setmana (€)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.tarifes.preu1Setmana}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, preu1Setmana: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Preu estàndard 1a setmana</span>
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>2 Setmanes (€)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.tarifes.preu2Setmanes}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, preu2Setmanes: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Total per a 2 setmanes</span>
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>3 Setmanes (€)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.tarifes.preu3Setmanes}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, preu3Setmanes: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Total per a 3 setmanes</span>
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>4 Setmanes (Complet) (€)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.tarifes.preu4Setmanes}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, preu4Setmanes: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Campus sencer (mes complet)</span>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#10b981" />
            <span>Suplements i Descomptes Especials</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label">Menjador (€ / setmana)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.tarifes.preuMenjadorSetmana}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, preuMenjadorSetmana: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Dinar i estada fins a les 15:30h</span>
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label">Escoleta Matinera (€ / setmana)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.tarifes.preuMatineraSetmana}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, preuMatineraSetmana: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Entrada anticipada des de les 7:45h</span>
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label">Descompte Socis C.D. Murense (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={config.tarifes.descompteSociPercent}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, descompteSociPercent: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Percentatge sobre la quota base</span>
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label className="form-label">Descompte Germans / Fam. Nombrosa (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={config.tarifes.descompteGermansPercent}
                onChange={(e) => setConfig({
                  ...config,
                  tarifes: { ...config.tarifes, descompteGermansPercent: Number(e.target.value) || 0 }
                })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>No acumulable segons normativa</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTINGUT DE LA PESTANYA 2: GRUPS I CAPACITATS */}
      {activeTab === 'grups' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                Categories del Campus
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Configura els límits de places, edats i monitors assignats per a cada grup esportiu.
              </p>
            </div>

            <button
              type="button"
              className="btn-hero-primary"
              onClick={handleOpenNewGroup}
              style={{ fontSize: '13px', padding: '7px 14px' }}
            >
              <Plus size={16} />
              <span>Afegir nou grup</span>
            </button>
          </div>

          <div className="groups-config-grid">
            {config.grups.map((grup) => (
              <article key={grup.id} className="group-config-card">
                <div className="group-card-header">
                  <div className="group-card-title-wrap">
                    <span className="group-color-indicator" style={{ backgroundColor: grup.color }} />
                    <div>
                      <h3 className="group-card-name" style={{ color: grup.color }}>{grup.nom}</h3>
                      <p className="group-card-sub">{grup.subtitol}</p>
                    </div>
                  </div>

                  <div className="group-card-actions">
                    <button
                      type="button"
                      className="btn-group-action"
                      onClick={() => handleOpenEditGroup(grup)}
                      title={`Editar ${grup.nom}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-group-action delete"
                      onClick={() => handleDeleteGroup(grup.id, grup.nom)}
                      title={`Eliminar ${grup.nom}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="group-card-meta-grid">
                  <div className="group-meta-item">
                    <span className="group-meta-label">
                      <Users size={12} />
                      Capacitat màx.
                    </span>
                    <span className="group-meta-val highlight">{grup.placesMaximes} places</span>
                  </div>

                  <div className="group-meta-item">
                    <span className="group-meta-label">
                      <UserCheck size={12} />
                      Ràtio Monitor
                    </span>
                    <span className="group-meta-val" style={{ fontSize: '12px' }}>{grup.ratioMonitor}</span>
                  </div>

                  <div className="group-meta-item">
                    <span className="group-meta-label">
                      <Clock size={12} />
                      Edats
                    </span>
                    <span className="group-meta-val" style={{ fontSize: '12px' }}>{grup.edats}</span>
                  </div>

                  <div className="group-meta-item">
                    <span className="group-meta-label">
                      <Waves size={12} />
                      Piscina
                    </span>
                    <span className="group-meta-val" style={{ fontSize: '12px' }}>{grup.tornPiscina}</span>
                  </div>
                </div>

                <div className="group-card-footer-info" style={{ marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: '#10b981' }} />
                    <span>Zona: <strong>{grup.zonaEntrenament}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} style={{ color: '#0284c7' }} />
                    <span>Pilota: <strong>{grup.pilotaRecomanada}</strong></span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* CONTINGUT DE LA PESTANYA 3: DADES BANCÀRIES I PAGAMENT */}
      {activeTab === 'banc' && (
        <div className="data-table-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="var(--primary)" />
              <span>Dades de Transferència i Formalització</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Aquestes dades s'indiquen a les famílies al Pas 5 (Resum d'inscripció) per fer el pagament de la quota.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Número de Compte (IBAN) *</label>
              <input
                type="text"
                className="form-input"
                value={config.banc.iban}
                onChange={(e) => setConfig({
                  ...config,
                  banc: { ...config.banc, iban: e.target.value }
                })}
                placeholder="ESXX XXXX XXXX XXXX XXXX"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entitat Bancària</label>
              <input
                type="text"
                className="form-input"
                value={config.banc.entitat}
                onChange={(e) => setConfig({
                  ...config,
                  banc: { ...config.banc, entitat: e.target.value }
                })}
                placeholder="Ex: Caixa Colonya / CaixaBank"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Titular del Compte</label>
              <input
                type="text"
                className="form-input"
                value={config.banc.titular}
                onChange={(e) => setConfig({
                  ...config,
                  banc: { ...config.banc, titular: e.target.value }
                })}
                placeholder="Club Esportiu C.D. Murense"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Concepte Recomanat</label>
              <input
                type="text"
                className="form-input"
                value={config.banc.concepte}
                onChange={(e) => setConfig({
                  ...config,
                  banc: { ...config.banc, concepte: e.target.value }
                })}
                placeholder="CAMPUS [NOM_INFANT] 2027"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data Límit de Pagament</label>
              <input
                type="text"
                className="form-input"
                value={config.banc.dataLimit}
                onChange={(e) => setConfig({
                  ...config,
                  banc: { ...config.banc, dataLimit: e.target.value }
                })}
                placeholder="Ex: 10/06/2027"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correu per Rebre Justificants</label>
              <input
                type="email"
                className="form-input"
                value={config.banc.emailJustificants}
                onChange={(e) => setConfig({
                  ...config,
                  banc: { ...config.banc, emailJustificants: e.target.value }
                })}
                placeholder="campuscdmurense@gmail.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Horari d'Atenció Presencial a l'Oficina del Club</label>
            <input
              type="text"
              className="form-input"
              value={config.banc.horariOficina}
              onChange={(e) => setConfig({
                ...config,
                banc: { ...config.banc, horariOficina: e.target.value }
              })}
              placeholder="Dilluns i Dimecres 18:30h - 20:00h | Dimarts 19:00h - 20:30h"
            />
          </div>
        </div>
      )}

      {/* CONTINGUT DE LA PESTANYA 4: CALENDARI I TORNS */}
      {activeTab === 'calendari' && (
        <div className="data-table-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" />
              <span>Edició del Campus i Dates de les Setmanes</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Modifica les dates de cada torn setmanal i l'estat d'admissió de noves inscripcions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Any de l'Edició</label>
              <input
                type="number"
                className="form-input"
                value={config.calendari.anyCampus}
                onChange={(e) => setConfig({
                  ...config,
                  calendari: { ...config.calendari, anyCampus: Number(e.target.value) || 2027 }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estat de les Inscripcions</label>
              <select
                className="form-select"
                value={config.calendari.estatInscripcions}
                onChange={(e) => setConfig({
                  ...config,
                  calendari: { 
                    ...config.calendari, 
                    estatInscripcions: e.target.value as 'OBERTA' | 'PAUSADA' | 'TANCADA' 
                  }
                })}
              >
                <option value="OBERTA">🟢 OBERTES (Acceptant formularis)</option>
                <option value="PAUSADA">🟡 PAUSADES (Llista d'espera)</option>
                <option value="TANCADA">🔴 TANCADES (Places exhaurides)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Bàner d'Avís Públic per a les Famílies</label>
            <input
              type="text"
              className="form-input"
              value={config.calendari.avisEstat}
              onChange={(e) => setConfig({
                ...config,
                calendari: { ...config.calendari, avisEstat: e.target.value }
              })}
              placeholder="Ex: Període d'inscripcions oficial obert per a nins i nines de 4 a 14 anys."
            />
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
            Torns Setmanals Disponibles
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {config.calendari.setmanes.map((setmana, idx) => (
              <div key={setmana.num} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  {setmana.nom}
                </strong>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Rang de Dates</label>
                  <input
                    type="text"
                    className="form-input"
                    value={setmana.dates}
                    onChange={(e) => handleWeekChange(idx, 'dates', e.target.value)}
                    placeholder="Ex: 28 Juny - 2 Juliol"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTINGUT DE LA PESTANYA 5: INSTAL·LACIONS I CONTACTE */}
      {activeTab === 'instalacions' && (
        <div className="data-table-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} color="var(--primary)" />
              <span>Horaris Generals i Contacte de Coordinació</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Dades de contacte ràpid, telèfons d'urgència i horaris de funcionament del campus.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Horari General del Campus</label>
              <input
                type="text"
                className="form-input"
                value={config.logistica.horariGeneral}
                onChange={(e) => setConfig({
                  ...config,
                  logistica: { ...config.logistica, horariGeneral: e.target.value }
                })}
                placeholder="9:00h a 14:00h"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horari Escoleta Matinera</label>
              <input
                type="text"
                className="form-input"
                value={config.logistica.horariMatinera}
                onChange={(e) => setConfig({
                  ...config,
                  logistica: { ...config.logistica, horariMatinera: e.target.value }
                })}
                placeholder="7:45h a 9:00h"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horari Menjador</label>
              <input
                type="text"
                className="form-input"
                value={config.logistica.horariMenjador}
                onChange={(e) => setConfig({
                  ...config,
                  logistica: { ...config.logistica, horariMenjador: e.target.value }
                })}
                placeholder="14:00h a 15:30h"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seu de les Instal·lacions</label>
              <input
                type="text"
                className="form-input"
                value={config.logistica.instalacions}
                onChange={(e) => setConfig({
                  ...config,
                  logistica: { ...config.logistica, instalacions: e.target.value }
                })}
                placeholder="Camp Municipal de Futbol de Muro (Mallorca)"
              />
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} color="#0066f5" />
            <span>Canals de Contacte de la Coordinació</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Telèfon de Coordinació</label>
              <input
                type="text"
                className="form-input"
                value={config.contacte.telefon}
                onChange={(e) => setConfig({
                  ...config,
                  contacte: { ...config.contacte, telefon: e.target.value }
                })}
                placeholder="612 345 678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número de WhatsApp (sense espais, amb prefix)</label>
              <input
                type="text"
                className="form-input"
                value={config.contacte.whatsapp}
                onChange={(e) => setConfig({
                  ...config,
                  contacte: { ...config.contacte, whatsapp: e.target.value }
                })}
                placeholder="34612345678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correu Oficial de Coordinació</label>
              <input
                type="email"
                className="form-input"
                value={config.contacte.email}
                onChange={(e) => setConfig({
                  ...config,
                  contacte: { ...config.contacte, email: e.target.value }
                })}
                placeholder="campus@cdmurense.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* Botó Flotant / Inferior de Desar Canvis */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="button"
          className="btn-hero-primary"
          onClick={handleSaveAllConfig}
          disabled={saving}
          style={{ padding: '10px 22px', fontSize: '14px' }}
        >
          <Save size={18} />
          <span>{saving ? 'Guardant a la base de dades...' : 'Desar tota la configuració'}</span>
        </button>
      </div>

      {/* Modal d'Edició / Creació de Grup */}
      {isGroupModalOpen && (
        <div className="noticia-modal-overlay" onClick={() => setIsGroupModalOpen(false)}>
          <div 
            className="noticia-modal-card" 
            style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="noticia-modal-header">
              <div>
                <h3 className="noticia-modal-title">
                  {editingGroup ? `Editar ${editingGroup.nom}` : 'Crear Nou Grup del Campus'}
                </h3>
                <p className="noticia-modal-subtitle">
                  Defineix el preu setmanal, suplements, capacitat i instal·lacions assignades
                </p>
              </div>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => setIsGroupModalOpen(false)}
                aria-label="Tancar formulari"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGroupModal} className="noticia-form">
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                  1. Dades Bàsiques i Identificació
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-nom">Nom del grup *</label>
                    <input
                      id="form-nom"
                      type="text"
                      className="form-input"
                      value={formNom}
                      onChange={(e) => setFormNom(e.target.value)}
                      placeholder="Ex: Grup A"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-color">Color identificatiu</label>
                    <select
                      id="form-color"
                      className="form-select"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                    >
                      <option value="#1d4ed8">Blau (#1d4ed8)</option>
                      <option value="#be185d">Rosa / Bordeus (#be185d)</option>
                      <option value="#15803d">Verd (#15803d)</option>
                      <option value="#ea580c">Taronja (#ea580c)</option>
                      <option value="#7c3aed">Lila (#7c3aed)</option>
                      <option value="#0284c7">Celeste (#0284c7)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-subtitol">Subtítol / Etapa</label>
                    <input
                      id="form-subtitol"
                      type="text"
                      className="form-input"
                      value={formSubtitol}
                      onChange={(e) => setFormSubtitol(e.target.value)}
                      placeholder="Ex: Iniciació i Psicomotricitat"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-edats">Franja d'edats</label>
                    <input
                      id="form-edats"
                      type="text"
                      className="form-input"
                      value={formEdats}
                      onChange={(e) => setFormEdats(e.target.value)}
                      placeholder="Ex: 4 a 7 anys (2019-2022)"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                  2. Capacitat i Ràtio de Monitors
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-places">Capacitat màxima (places) *</label>
                    <input
                      id="form-places"
                      type="number"
                      min="1"
                      max="100"
                      className="form-input"
                      value={formPlaces}
                      onChange={(e) => setFormPlaces(Number(e.target.value) || 25)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-ratio">Ràtio monitor / nins</label>
                    <input
                      id="form-ratio"
                      type="text"
                      className="form-input"
                      value={formRatio}
                      onChange={(e) => setFormRatio(e.target.value)}
                      placeholder="Ex: 1 monitor / 8 nins"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                  3. Instal·lacions i Logística Esportiva
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-zona">Zona d'entrenament</label>
                    <input
                      id="form-zona"
                      type="text"
                      className="form-input"
                      value={formZona}
                      onChange={(e) => setFormZona(e.target.value)}
                      placeholder="Ex: Camp F7 A i Poliesportiu"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-piscina">Torn de piscina diària</label>
                    <input
                      id="form-piscina"
                      type="text"
                      className="form-input"
                      value={formPiscina}
                      onChange={(e) => setFormPiscina(e.target.value)}
                      placeholder="Ex: 11:30h a 12:30h"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="form-pilota">Mida de pilota recomanada</label>
                  <input
                    id="form-pilota"
                    type="text"
                    className="form-input"
                    value={formPilota}
                    onChange={(e) => setFormPilota(e.target.value)}
                    placeholder="Ex: Talla 3 (Peques) o Talla 4 / 5"
                  />
                </div>
              </div>

              <div className="noticia-modal-actions">
                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => setIsGroupModalOpen(false)}
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="btn-hero-primary"
                >
                  <Save size={16} />
                  <span>{editingGroup ? 'Guardar canvis del grup' : 'Crear grup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
