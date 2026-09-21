// frontend/src/pages/public/inscripcion/Step1DadesNen.tsx
import React, { useState } from 'react';
import { Camera, Calendar, ArrowRight, User } from 'lucide-react';
import type { DadesNenForm, SexeType } from '../../../types/inscripcio';

interface Step1DadesNenProps {
  initialData: DadesNenForm;
  onNext: (data: DadesNenForm) => void;
}

const COLEGIO_OPTIONS = [
  'CEIP Joan Mas (Muro)',
  'Col·legi Sant Francesc d’Assís (Muro)',
  'CEIP Son Ferrer',
  'CEIP Can Picafort',
  'CEIP Voramar',
  'Altre centre escolar',
];

const CURSO_OPTIONS = [
  'Educació Infantil (3-5 anys)',
  '1r Primària',
  '2n Primària',
  '3r Primària',
  '4t Primària',
  '5è Primària',
  '6è Primària',
  '1r ESO',
  '2n ESO',
];

export const Step1DadesNen: React.FC<Step1DadesNenProps> = ({ initialData, onNext }) => {
  const [formData, setFormData] = useState<DadesNenForm>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSexeChange = (sexe: SexeType) => {
    setFormData((prev) => ({ ...prev, sexe }));
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, fotoUrl: url }));
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'El nom és obligatori';
    }
    if (!formData.cognoms.trim()) {
      newErrors.cognoms = 'Els cognoms són obligatoris';
    }
    if (!formData.dataNaixement) {
      newErrors.dataNaixement = 'La data de naixement és obligatòria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext(formData);
  };

  return (
    <form onSubmit={validateAndSubmit} className="wizard-step-form" noValidate>
      <div className="step-section-header">
        <h2 className="step-title">Dades del nin / nina</h2>
        <p className="step-subtitle">Informació bàsica per a la fitxa de l'alumne/a</p>
      </div>

      {/* 1. Selector de Avatar / Foto amb botó de càmera */}
      <div className="avatar-picker-container">
        <div className="avatar-circle">
          {formData.fotoUrl ? (
            <img src={formData.fotoUrl} alt="Foto de l'alumne" className="avatar-image" />
          ) : (
            <User size={48} className="avatar-placeholder-icon" />
          )}
          <label htmlFor="avatar-file-input" className="avatar-camera-badge" title="Pujar foto">
            <Camera size={16} color="#ffffff" />
            <input 
              id="avatar-file-input"
              type="file" 
              accept="image/*" 
              onChange={handleFotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* 2. Nom */}
      <div className="form-group">
        <label className="form-label" htmlFor="nom-alumne">
          Nom <span className="required-star">*</span>
        </label>
        <input
          id="nom-alumne"
          type="text"
          className={`form-input ${errors.nom ? 'error' : ''}`}
          placeholder="Ex: Martí"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
        />
        {errors.nom && <span className="field-error-msg">{errors.nom}</span>}
      </div>

      {/* 3. Cognoms */}
      <div className="form-group">
        <label className="form-label" htmlFor="cognoms-alumne">
          Cognoms <span className="required-star">*</span>
        </label>
        <input
          id="cognoms-alumne"
          type="text"
          className={`form-input ${errors.cognoms ? 'error' : ''}`}
          placeholder="Ex: García López"
          value={formData.cognoms}
          onChange={(e) => setFormData({ ...formData, cognoms: e.target.value })}
        />
        {errors.cognoms && <span className="field-error-msg">{errors.cognoms}</span>}
      </div>

      {/* 4. Data de naixement */}
      <div className="form-group">
        <label className="form-label" htmlFor="data-naixement">
          Data de naixement <span className="required-star">*</span>
        </label>
        <div className="input-with-icon">
          <input
            id="data-naixement"
            type="date"
            className={`form-input ${errors.dataNaixement ? 'error' : ''}`}
            value={formData.dataNaixement}
            onChange={(e) => setFormData({ ...formData, dataNaixement: e.target.value })}
          />
          <Calendar size={18} className="input-right-icon" />
        </div>
        {errors.dataNaixement && <span className="field-error-msg">{errors.dataNaixement}</span>}
      </div>

      {/* 5. Sexe (Toggle Niño / Niña) */}
      <div className="form-group">
        <label className="form-label">
          Sexe <span className="required-star">*</span>
        </label>
        <div className="gender-toggle-group">
          <button
            type="button"
            className={`gender-toggle-btn ${formData.sexe === 'nen' ? 'active' : ''}`}
            onClick={() => handleSexeChange('nen')}
          >
            <span className="gender-indicator">◆</span>
            <span>Nin (Masculí)</span>
          </button>

          <button
            type="button"
            className={`gender-toggle-btn ${formData.sexe === 'nena' ? 'active' : ''}`}
            onClick={() => handleSexeChange('nena')}
          >
            <span className="gender-indicator">◆</span>
            <span>Nina (Femení)</span>
          </button>
        </div>
      </div>

      {/* 6. Col·legi */}
      <div className="form-group">
        <label className="form-label" htmlFor="colegi-select">
          Col·legi / Centre Escolar
        </label>
        <select
          id="colegi-select"
          className="form-select"
          value={formData.colegi}
          onChange={(e) => setFormData({ ...formData, colegi: e.target.value })}
        >
          {COLEGIO_OPTIONS.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* 7. Curs Escolar */}
      <div className="form-group">
        <label className="form-label" htmlFor="curs-select">
          Curs actual
        </label>
        <select
          id="curs-select"
          className="form-select"
          value={formData.curs}
          onChange={(e) => setFormData({ ...formData, curs: e.target.value })}
        >
          {CURSO_OPTIONS.map((curs) => (
            <option key={curs} value={curs}>
              {curs}
            </option>
          ))}
        </select>
      </div>

      {/* 8. Botó de següent pas */}
      <div className="wizard-actions">
        <button type="submit" className="btn-wizard-next" id="btn-pas-seguent">
          <span>Següent pas</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};
