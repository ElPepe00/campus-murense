// frontend/src/pages/public/registration/Step2TutorData.tsx
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
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
  const [autoritzat, setAutoritzat] = useState<PersonaAutoritzadaForm>(
    initialAutoritzats[0] || { nomComplet: '', dni: '', parentiu: 'Familiar / Tutor' }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!tutor.nomComplet.trim()) {
      newErrors.nomComplet = 'El nom complet del tutor és obligatori';
    }
    if (!tutor.telefonPrincipal.trim()) {
      newErrors.telefonPrincipal = 'El telèfon principal és obligatori';
    }
    if (!tutor.email.trim() || !tutor.email.includes('@')) {
      newErrors.email = 'Introdueix un correu electrònic vàlid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const autoritzatsList = autoritzat.nomComplet.trim() ? [autoritzat] : [];
    onNext(tutor, autoritzatsList);
  };

  return (
    <form onSubmit={validateAndSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">Dades de Contacte i Tutors Legals</h2>
        <p className="step-card-subtitle">
          Informació del pare, mare o tutor legal per a comunicacions, urgències i autoritzacions.
        </p>
      </div>

      <div className="step-fields-grid">
        {/* Nom complet del tutor */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="tutor-nom">Nom complet del pare / mare / tutor legal *</label>
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

        {/* DNI Tutor */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-dni">DNI / NIE del tutor</label>
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
            <option value="Tutor Legal">Tutor/a Legal</option>
            <option value="Altre">Altre familiar</option>
          </select>
        </div>

        {/* Telèfon Principal */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-tel1">Telèfon de contacte principal *</label>
          <input
            id="tutor-tel1"
            type="tel"
            className={`form-input ${errors.telefonPrincipal ? 'input-error' : ''}`}
            placeholder="Ex: 611 22 33 44"
            value={tutor.telefonPrincipal}
            onChange={(e) => setTutor({ ...tutor, telefonPrincipal: e.target.value })}
            required
          />
          {errors.telefonPrincipal && <span className="error-text">{errors.telefonPrincipal}</span>}
        </div>

        {/* Telèfon Secundari */}
        <div className="form-group">
          <label className="form-label" htmlFor="tutor-tel2">Telèfon d'urgència o segon tutor</label>
          <input
            id="tutor-tel2"
            type="tel"
            className="form-input"
            placeholder="Ex: 622 33 44 55 (opcional)"
            value={tutor.telefonSecundari || ''}
            onChange={(e) => setTutor({ ...tutor, telefonSecundari: e.target.value })}
          />
        </div>

        {/* Correu electrònic */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="tutor-email">Correu electrònic *</label>
          <input
            id="tutor-email"
            type="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="Ex: familia@email.com"
            value={tutor.email}
            onChange={(e) => setTutor({ ...tutor, email: e.target.value })}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
      </div>

      {/* Secció de persona autoritzada per a la recollida */}
      <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <UserCheck size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Persona addicional autoritzada per a la recollida (opcional)
          </h3>
        </div>

        <div className="step-fields-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="auto-nom">Nom complet</label>
            <input
              id="auto-nom"
              type="text"
              className="form-input"
              placeholder="Ex: Joan Martorell (Padrí)"
              value={autoritzat.nomComplet}
              onChange={(e) => setAutoritzat({ ...autoritzat, nomComplet: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auto-dni">DNI / NIE</label>
            <input
              id="auto-dni"
              type="text"
              className="form-input"
              placeholder="Ex: 43987654Z"
              value={autoritzat.dni}
              onChange={(e) => setAutoritzat({ ...autoritzat, dni: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Botons de navegació */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn-step-prev"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Pas anterior</span>
        </button>

        <button
          type="submit"
          className="btn-step-next"
          id="btn-step2-continuar"
        >
          <span>Continuar a Serveis i Setmanes</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step2TutorData;
