// frontend/src/pages/admin/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  UserCheck, 
  Bell, 
  ShieldCheck, 
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Coins,
  CheckCircle2,
  Clock,
  Waves,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface CampusGroupConfig {
  id: string;
  nom: string;
  subtitol: string;
  edats: string;
  color: string;
  placesMaximes: number;
  ratioMonitor: string;
  preuSetmana: number;
  preuMenjadorSetmana: number;
  preuMatineraSetmana: number;
  descompteGermansPercent: number;
  zonaEntrenament: string;
  tornPiscina: string;
  pilotaRecomanada: string;
}

const STORAGE_GROUPS_KEY = 'campus_murense_grups';

const DEFAULT_GROUPS: CampusGroupConfig[] = [
  {
    id: 'grup-a',
    nom: 'Grup A',
    subtitol: 'Iniciació i Psicomotricitat',
    edats: '4 a 7 anys (nascuts 2019–2022)',
    color: '#1d4ed8',
    placesMaximes: 25,
    ratioMonitor: '1 monitor / 8 nins',
    preuSetmana: 40,
    preuMenjadorSetmana: 25,
    preuMatineraSetmana: 10,
    descompteGermansPercent: 10,
    zonaEntrenament: 'Camp F7 A i Poliesportiu',
    tornPiscina: '11:30h a 12:30h',
    pilotaRecomanada: 'Talla 3',
  },
  {
    id: 'grup-b',
    nom: 'Grup B',
    subtitol: 'Desenvolupament i Tècnica',
    edats: '8 a 10 anys (nascuts 2016–2018)',
    color: '#be185d',
    placesMaximes: 30,
    ratioMonitor: '1 monitor / 12 nins',
    preuSetmana: 40,
    preuMenjadorSetmana: 25,
    preuMatineraSetmana: 10,
    descompteGermansPercent: 10,
    zonaEntrenament: 'Camp Gespa Principal F7',
    tornPiscina: '12:30h a 13:30h',
    pilotaRecomanada: 'Talla 4',
  },
  {
    id: 'grup-c',
    nom: 'Grup C',
    subtitol: 'Tecnificació i Rendiment',
    edats: '11 a 14 anys (nascuts 2013–2015)',
    color: '#15803d',
    placesMaximes: 30,
    ratioMonitor: '1 monitor / 15 nins',
    preuSetmana: 45,
    preuMenjadorSetmana: 25,
    preuMatineraSetmana: 10,
    descompteGermansPercent: 10,
    zonaEntrenament: 'Camp F11 Principal',
    tornPiscina: '13:00h a 14:00h',
    pilotaRecomanada: 'Talla 5',
  },
];

/**
 * Pantalla de configuració general del club, paràmetres dels grups, tarifes i quotes (Pantalla 8).
 */
export const SettingsPage: React.FC = () => {
  const { usuari } = useAuth();
  const [grups, setGrups] = useState<CampusGroupConfig[]>([]);
  const [editingGroup, setEditingGroup] = useState<CampusGroupConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Camps del formulari
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

  // Carregar grups des de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_GROUPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGrups(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Error carregant configuració de grups:', e);
    }
    setGrups(DEFAULT_GROUPS);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenNewGroup = () => {
    setEditingGroup(null);
    setFormNom(`Grup ${String.fromCharCode(65 + grups.length)}`);
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
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
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

    let newGrupsList: CampusGroupConfig[];
    if (editingGroup) {
      newGrupsList = grups.map((g) => (g.id === editingGroup.id ? updatedGroupData : g));
      showToast(`S'ha actualitzat la configuració de ${updatedGroupData.nom}`);
    } else {
      newGrupsList = [...grups, updatedGroupData];
      showToast(`S'ha creat el nou grup ${updatedGroupData.nom}`);
    }

    setGrups(newGrupsList);
    try {
      localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(newGrupsList));
    } catch (err) {
      console.error('Error desant grups a localStorage:', err);
    }
    setIsModalOpen(false);
  };

  const handleDeleteGroup = (id: string, nom: string) => {
    if (window.confirm(`Segur que vols eliminar ${nom} i la seva configuració?`)) {
      const updated = grups.filter((g) => g.id !== id);
      setGrups(updated);
      try {
        localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error desant grups:', err);
      }
      showToast(`S'ha eliminat ${nom}`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Vols restablir la configuració dels grups i tarifes als valors inicials?')) {
      setGrups(DEFAULT_GROUPS);
      localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(DEFAULT_GROUPS));
      showToast('Configuració de grups restablerta per defecte');
    }
  };

  return (
    <div className="admin-page-container" style={{ maxWidth: '960px' }}>
      {/* Capçalera */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Configuració del Campus</h1>
          <p className="admin-page-subtitle">Gestió de grups d'edat, quotes setmanals, ràtios i paràmetres logístics</p>
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

      {/* Estat de l'usuari actual connectat */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '18px 22px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#eff6ff',
            color: '#0066f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{usuari?.nom_complet || 'Coordinador Campus'}</strong>
            <p style={{ fontSize: '12.5px', color: '#64748b' }}>{usuari?.email} • Rol: {usuari?.rol || 'Staff'}</p>
          </div>
        </div>

        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          background: '#ecfdf5',
          color: '#065f46',
          padding: '4px 12px',
          borderRadius: '999px'
        }}>
          Sessió activa
        </span>
      </div>

      {/* Secció 1: Grups i Categories del Campus */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" />
            <span>Grups, Quotes i Capacitat</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Configura els preus per setmana, suplements opcionals, aforaments i ràtios per categoria.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-topbar-ghost"
            onClick={handleResetDefaults}
            style={{ fontSize: '12.5px', padding: '7px 12px' }}
            title="Restablir valors inicials"
          >
            Valors per defecte
          </button>

          <button
            type="button"
            className="btn-hero-primary"
            onClick={handleOpenNewGroup}
            style={{ padding: '8px 16px', fontSize: '13.5px' }}
          >
            <Plus size={16} />
            <span>Nou grup</span>
          </button>
        </div>
      </div>

      {/* Graella de Targetes de Grups */}
      <div className="groups-config-grid">
        {grups.map((grup) => (
          <article key={grup.id} className="group-config-card">
            {/* Capçalera del grup */}
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

            {/* Graella de paràmetres clau */}
            <div className="group-card-meta-grid">
              <div className="group-meta-item">
                <span className="group-meta-label">
                  <Coins size={12} />
                  Quota setmana
                </span>
                <span className="group-meta-val highlight">{grup.preuSetmana} €</span>
              </div>

              <div className="group-meta-item">
                <span className="group-meta-label">
                  <Users size={12} />
                  Capacitat màx.
                </span>
                <span className="group-meta-val">{grup.placesMaximes} places</span>
              </div>

              <div className="group-meta-item">
                <span className="group-meta-label">
                  <UserCheck size={12} />
                  Ràtio
                </span>
                <span className="group-meta-val" style={{ fontSize: '12px' }}>{grup.ratioMonitor}</span>
              </div>

              <div className="group-meta-item">
                <span className="group-meta-label">
                  <Sparkles size={12} />
                  Desc. germans
                </span>
                <span className="group-meta-val">-{grup.descompteGermansPercent}%</span>
              </div>
            </div>

            {/* Suplements de menjador i matinera */}
            <div className="group-supplements-box">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Menjador:</span>
                <strong>+{grup.preuMenjadorSetmana} €/setmana</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Matinera:</span>
                <strong>+{grup.preuMatineraSetmana} €/setmana</strong>
              </div>
            </div>

            {/* Detalls esportius i logístics */}
            <div className="group-card-footer-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} style={{ color: '#0066f5' }} />
                <span>Edats: <strong>{grup.edats}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: '#10b981' }} />
                <span>Zona: <strong>{grup.zonaEntrenament}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Waves size={13} style={{ color: '#0284c7' }} />
                <span>Piscina: <strong>{grup.tornPiscina}</strong></span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Secció 2: Paràmetres Generals del Club */}
      <div style={{ marginTop: '16px', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={18} color="var(--primary)" />
          <span>Informació i Paràmetres Generals</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Consulteu les condicions generals de les instal·lacions, notificacions i protecció de dades.
        </p>
      </div>

      <div className="menu-list" style={{ boxShadow: 'var(--shadow-card)', borderRadius: '16px' }}>
        <div 
          className="menu-item"
          onClick={() => alert("Dades generals Campus C.D. Murense:\n• Edició: Estiu 2027\n• Dates: 23 de Juny a 31 de Juliol\n• Horari general: 9:00h a 14:00h\n• Matinera: Des de les 7:45h\n• Menjador: Fins a les 15:30h")}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#eff6ff', color: '#0066f5' }}>
              <Building size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Dades generals del campus</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Calendari oficial, franges horàries i seu municipal</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert("Equip de monitors C.D. Murense:\n• 1 Director esportiu i Coordinador general\n• 4 Monitors diplomats en activitat física i lleure\n• 1 Socorrista titulat permanent a la piscina")}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Monitors i equip tècnic</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Personal autoritzat per a passar llista i coordinació</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert("Notificacions del campus:\n• Missatges d'assistència i avisos urgents via email i web pública.\n• Recordatoris automàtics de quotes de pagament.")}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <Bell size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Canals de notificació</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Avisos automàtics de comunicats i pagaments pendents</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>

        <div 
          className="menu-item"
          onClick={() => alert("Informació legal i RGPD:\n• Tractament de dades de menors d'edat regulat segons la LOPDGDD.\n• Autoritzacions mèdiques, administració de medicaments i drets d'imatge validats en el formulari d'inscripció.")}
          role="button"
          tabIndex={0}
        >
          <div className="menu-item-left">
            <div className="menu-item-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong className="menu-item-text">Informació legal i RGPD</strong>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Protecció de dades de menors, al·lèrgies i drets d'imatge</p>
            </div>
          </div>
          <ChevronRight size={18} className="menu-item-arrow" />
        </div>
      </div>

      {/* Modal d'Edició / Creació de Grup */}
      {isModalOpen && (
        <div className="noticia-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div 
            className="noticia-modal-card" 
            style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="noticia-modal-header">
              <div>
                <h3 className="noticia-modal-title">
                  {editingGroup ? `Editar configuració de ${editingGroup.nom}` : 'Crear Nou Grup del Campus'}
                </h3>
                <p className="noticia-modal-subtitle">
                  Defineix el preu setmanal, suplements, capacitat i instal·lacions assignades
                </p>
              </div>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Tancar formulari"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="noticia-form">
              {/* Bloc 1: Dades Bàsiques */}
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
                    <label className="form-label" htmlFor="form-edats">Rang d'edats *</label>
                    <input
                      id="form-edats"
                      type="text"
                      className="form-input"
                      value={formEdats}
                      onChange={(e) => setFormEdats(e.target.value)}
                      placeholder="Ex: 4 a 7 anys (2019-2022)"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bloc 2: Preus i Quotes */}
              <div style={{ marginBottom: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                  2. Quotes i Tarifes Econòmiques
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-preu" style={{ fontSize: '12px' }}>Preu Setmana (€)</label>
                    <input
                      id="form-preu"
                      type="number"
                      min={0}
                      className="form-input"
                      value={formPreu}
                      onChange={(e) => setFormPreu(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-menjador" style={{ fontSize: '12px' }}>Menjador (€/set)</label>
                    <input
                      id="form-menjador"
                      type="number"
                      min={0}
                      className="form-input"
                      value={formMenjador}
                      onChange={(e) => setFormMenjador(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-matinera" style={{ fontSize: '12px' }}>Matinera (€/set)</label>
                    <input
                      id="form-matinera"
                      type="number"
                      min={0}
                      className="form-input"
                      value={formMatinera}
                      onChange={(e) => setFormMatinera(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-descompte" style={{ fontSize: '12px' }}>Desc. Germans (%)</label>
                    <input
                      id="form-descompte"
                      type="number"
                      min={0}
                      max={100}
                      className="form-input"
                      value={formDescompte}
                      onChange={(e) => setFormDescompte(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Bloc 3: Capacitat i Ràtios */}
              <div style={{ marginBottom: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                  3. Capacitat i Ràtios d'Entrenadors
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-places">Places màximes (aforament) *</label>
                    <input
                      id="form-places"
                      type="number"
                      min={1}
                      className="form-input"
                      value={formPlaces}
                      onChange={(e) => setFormPlaces(Number(e.target.value))}
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
                      placeholder="Ex: 1 monitor / 10 nins"
                    />
                  </div>
                </div>
              </div>

              {/* Bloc 4: Instal·lacions i Logística */}
              <div style={{ marginBottom: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                  4. Logística i Equipament Esportiu
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-zona" style={{ fontSize: '12px' }}>Zona del Camp</label>
                    <input
                      id="form-zona"
                      type="text"
                      className="form-input"
                      value={formZona}
                      onChange={(e) => setFormZona(e.target.value)}
                      placeholder="Ex: Camp F7 A"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-piscina" style={{ fontSize: '12px' }}>Torn de Piscina</label>
                    <input
                      id="form-piscina"
                      type="text"
                      className="form-input"
                      value={formPiscina}
                      onChange={(e) => setFormPiscina(e.target.value)}
                      placeholder="Ex: 11:30h a 12:30h"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="form-pilota" style={{ fontSize: '12px' }}>Pilota</label>
                    <select
                      id="form-pilota"
                      className="form-select"
                      value={formPilota}
                      onChange={(e) => setFormPilota(e.target.value)}
                    >
                      <option value="Talla 3">Talla 3</option>
                      <option value="Talla 4">Talla 4</option>
                      <option value="Talla 5">Talla 5</option>
                      <option value="Multiesport">Multiesport</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botons d'acció */}
              <div className="noticia-modal-footer">
                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 18px', fontSize: '14px' }}
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="btn-hero-primary"
                  style={{ padding: '9px 20px', fontSize: '14px' }}
                >
                  {editingGroup ? 'Desar canvis' : 'Crear grup'}
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
