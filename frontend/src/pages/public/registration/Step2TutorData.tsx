// frontend/src/pages/public/registration/Step2TutorData.tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCheck, Plus, Trash2 } from 'lucide-react';
import type { DadesTutorForm, PersonaAutoritzadaForm } from '../../../types/inscripcio';

interface Step2TutorDataProps {
  initialTutor: DadesTutorForm;
  initialAutoritzats: PersonaAutoritzadaForm[];
  onBack: () => void;
  onNext: (tutor: DadesTutorForm, autoritzats: PersonaAutoritzadaForm[]) => void;
}

export const Step2TutorData: React.FC<Step2TutorDataProps> = ({
  initialTutor,
  initialAutoritzats,
  onBack,
  onNext,
}) => {
  const [tutor, setTutor] = useState<DadesTutorForm>(initialTutor);
  const [autoritzats, setAutoritzats] = useState<PersonaAutoritzadaForm[]>(
    initialAutoritzats.length > 0
      ? initialAutoritzats
      : [{ nomComplet: '', dni: '', parentiu: 'Familiar' }]
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddAutoritzat = () => {
    setAutoritzats([...autoritzats, { nomComplet: '', dni: '', parentiu: 'Familiar' }]);
  };

  const handleRemoveAutoritzat = (index: number) => {
    setAutoritzats(autoritzats.filter((_, i) => i !== index));
  };

  const handleAutoritzatChange = (index: number, field: keyof PersonaAutoritzadaForm, value: string) => {
    const updated = [...autoritzats];
    updated[index] = { ...updated[index], [field]: value };
    setAutoritzats(updated);
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!tutor.nomEmplenaFormulari.trim()) {
      newErrors.nomEmplenaFormulari = 'Indica el nom de la persona que emplena el formulari';
    }
    if (!tutor.nomComplet.trim()) {
      newErrors.nomComplet = 'El nom del representant legal és obligatori';
    }
    if (!tutor.telefonPrincipal.trim()) {
      newErrors.telefonPrincipal = 'El telèfon principal de contacte és obligatori';
    }
    if (!tutor.email.trim() || !tutor.email.includes('@')) {
      newErrors.email = 'Introdueix una adreça electrònica vàlida (@)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const filteredAutoritzats = autoritzats.filter((a) => a.nomComplet.trim().length > 0);
    onNext(tutor, filteredAutoritzats);
  };

  return (
    <form onSubmit={validateAndSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">1 - Inscripcions al Campus: Representants i Contacte</h2>
        <p className="step-card-subtitle">
          Dades del representant legal, canals de comunicació i persones autoritzades a recollir l'infant.
        </p>
      </div>

      <div className="step-fields-grid">
        {/* Nom de qui emplena el formulari */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="tutor-emplena">
            Nom de qui emplena es formulari *
          </label>
          <input
            id="tutor-emplena"
            type="text"
            className={`form-input ${errors.nomEmplenaFormulari ? 'input-error' : ''}`}
            placeholder="Ex: Maria Martorell (mare) / Joan Garcia (pare)"
            value={tutor.nomEmplenaFormulari}
            onChange={(e) => setTutor({ ...tutor, nomEmplenaFormulari: e.target.value })}
            required
          />
          {errors.nomEmplenaFormulari && <span className="error-text">{errors.nomEmplenaFormulari}</span>}
        </div>

        {/* Nom del/la representant legal */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="tutor-nom">
            Nom del/la representant legal (mare, pare o tutor/a) *
          </label>
          <input
            id="tutor-nom"
            type="text"
            className={`form-input ${errors.nomComplet ? 'input-error' : ''}`}
            placeholder="Ex: Maria Martorell Serra"
            value={tutor.nomComplet}
            onChange={(e) => setTutor({ ...tutor, nomComplet: e.target.value })}
            required
          />
          {errors.nomComplet && <span className="error-text">{errors.nomComplet}</span>}
        </div>

        {/* DNI Representant */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-dni">DNI / NIE del representant legal</label>
          <input
            id="tutor-dni"
            type="text"
            className="form-input"
            placeholder="Ex: 43123456X"
            value={tutor.dni || ''}
            onChange={(e) => setTutor({ ...tutor, dni: e.target.value })}
          />
        </div>

        {/* Parentiu */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-parentiu">Parentiu</label>
          <select
            id="tutor-parentiu"
            className="form-select"
            value={tutor.parentiu || 'Mare'}
            onChange={(e) => setTutor({ ...tutor, parentiu: e.target.value })}
          >
            <option value="Mare">Mare</option>
            <option value="Pare">Pare</option>
            <option value="Tutor/a Legal">Tutor/a Legal</option>
            <option value="Altre representant">Altre representant legal</option>
          </select>
        </div>

        {/* Adreça electrònica */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="tutor-email">Adreça electrònica (@) *</label>
          <input
            id="tutor-email"
            type="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="Ex: familia@gmail.com"
            value={tutor.email}
            onChange={(e) => setTutor({ ...tutor, email: e.target.value })}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Telèfon 1 */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-tel1">Telèfon de contacte 1 (principal) *</label>
          <input
            id="tutor-tel1"
            type="tel"
            className={`form-input ${errors.telefonPrincipal ? 'input-error' : ''}`}
            placeholder="Ex: 612 345 678"
            value={tutor.telefonPrincipal}
            onChange={(e) => setTutor({ ...tutor, telefonPrincipal: e.target.value })}
            required
          />
          {errors.telefonPrincipal && <span className="error-text">{errors.telefonPrincipal}</span>}
        </div>

        {/* Telèfon 2 */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-tel2">Telèfon de contacte 2 (urgències)</label>
          <input
            id="tutor-tel2"
            type="tel"
            className="form-input"
            placeholder="Ex: 623 456 789"
            value={tutor.telefonSecundari || ''}
            onChange={(e) => setTutor({ ...tutor, telefonSecundari: e.target.value })}
          />
        </div>
      </div>

      {/* Persones autoritzades a recollir */}
      <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="var(--primary)" />
              <span>Persones autoritzades a recollir l'infant</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Nom complet + DNI de les persones autoritzades a recollir el nin o la nina que no siguin els representants legals (familiars, padrins, etc.)
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAutoritzat}
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: 'var(--primary)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span>Afegir persona</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {autoritzats.map((aut, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr auto',
                gap: '12px',
                alignItems: 'center',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Nom complet (Ex: Joan Garcia - Padrí)"
                value={aut.nomComplet}
                onChange={(e) => handleAutoritzatChange(idx, 'nomComplet', e.target.value)}
                style={{ height: '40px', fontSize: '13.5px' }}
              />

              <input
                type="text"
                className="form-input"
                placeholder="DNI de la persona"
                value={aut.dni}
                onChange={(e) => handleAutoritzatChange(idx, 'dni', e.target.value)}
                style={{ height: '40px', fontSize: '13.5px' }}
              />

              <input
                type="text"
                className="form-input"
                placeholder="Parentiu (Ex: Padrí, Oncle, Veí)"
                value={aut.parentiu || ''}
                onChange={(e) => handleAutoritzatChange(idx, 'parentiu', e.target.value)}
                style={{ height: '40px', fontSize: '13.5px' }}
              />

              {autoritzats.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAutoritzat(idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                  title="Eliminar autorització"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botons d'acció */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn-step-prev"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Tornar a Dades Infant</span>
        </button>

        <button
          type="submit"
          className="btn-step-next"
          id="btn-step2-continuar"
        >
          <span>Continuar a Serveis i Preus</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step2TutorData;
