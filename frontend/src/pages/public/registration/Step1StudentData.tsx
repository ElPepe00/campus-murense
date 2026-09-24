// frontend/src/pages/public/registration/Step1StudentData.tsx
import React, { useState } from 'react';
import { Camera, Calendar, ArrowRight, User } from 'lucide-react';
import type { DadesNenForm, SexeType } from '../../../types/inscripcio';

interface Step1StudentDataProps {
  initialData: DadesNenForm;
  onNext: (data: DadesNenForm) => void;
}

const ESCOLES_OPTIONS = [
  'CEIP Joan Mas (Muro)',
  'Col·legi Sant Francesc d’Assís (Muro)',
  'CEIP Son Ferrer',
  'CEIP Can Picafort',
  'CEIP Voramar',
  'Altre centre escolar',
];

const CURSOS_OPTIONS = [
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

/**
 * Pas 1 de la inscripció: Dades bàsiques de l'infant (nom, data naixement, sexe, escola i curs).
 */
export const Step1StudentData: React.FC<Step1StudentDataProps> = ({ initialData, onNext }) => {
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
    <form onSubmit={validateAndSubmit} className="step-card">
      <div className="step-card-header">
        <h2 className="step-card-title">Dades Personals de l'Infant</h2>
        <p className="step-card-subtitle">
          Introdueix la informació bàsica del participant al Campus C.D. Murense 2027.
        </p>
      </div>

      {/* Pujada de Fotografia */}
      <div className="photo-upload-section">
        <div className="photo-preview-circle">
          {formData.fotoUrl ? (
            <img src={formData.fotoUrl} alt="Foto de l'infant" className="photo-img-uploaded" />
          ) : (
            <User size={40} className="photo-placeholder-icon" />
          )}
          <label className="photo-badge-btn" htmlFor="foto-upload-input" title="Pujar foto">
            <Camera size={16} />
            <input
              id="foto-upload-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFotoUpload}
            />
          </label>
        </div>
        <div className="photo-hint-col">
          <span className="photo-hint-title">Fotografia de l'infant (opcional)</span>
          <span className="photo-hint-text">Ajudarà als monitors a reconèixer-lo més ràpidament el primer dia.</span>
        </div>
      </div>

      <div className="step-fields-grid">
        {/* Nom */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-nom">Nom de l'infant *</label>
          <input
            id="nen-nom"
            type="text"
            className={`form-input ${errors.nom ? 'input-error' : ''}`}
            placeholder="Ex: Pau"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          {errors.nom && <span className="error-text">{errors.nom}</span>}
        </div>

        {/* Cognoms */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-cognoms">Cognoms *</label>
          <input
            id="nen-cognoms"
            type="text"
            className={`form-input ${errors.cognoms ? 'input-error' : ''}`}
            placeholder="Ex: Garcia Martorell"
            value={formData.cognoms}
            onChange={(e) => setFormData({ ...formData, cognoms: e.target.value })}
            required
          />
          {errors.cognoms && <span className="error-text">{errors.cognoms}</span>}
        </div>

        {/* Data de Naixement */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-data">Data de naixement *</label>
          <div className="input-with-icon">
            <input
              id="nen-data"
              type="date"
              className={`form-input ${errors.dataNaixement ? 'input-error' : ''}`}
              value={formData.dataNaixement}
              onChange={(e) => setFormData({ ...formData, dataNaixement: e.target.value })}
              required
            />
            <Calendar size={18} className="input-right-icon" />
          </div>
          {errors.dataNaixement && <span className="error-text">{errors.dataNaixement}</span>}
        </div>

        {/* Sexe */}
        <div className="form-group">
          <label className="form-label">Sexe *</label>
          <div className="gender-toggle-row">
            <button
              type="button"
              className={`btn-gender ${formData.sexe === 'nen' ? 'active' : ''}`}
              onClick={() => handleSexeChange('nen')}
            >
              Nen
            </button>
            <button
              type="button"
              className={`btn-gender ${formData.sexe === 'nena' ? 'active' : ''}`}
              onClick={() => handleSexeChange('nena')}
            >
              Nena
            </button>
          </div>
        </div>

        {/* Escola */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-escola">Col·legi o Escola *</label>
          <select
            id="nen-escola"
            className="form-select"
            value={formData.colegi}
            onChange={(e) => setFormData({ ...formData, colegi: e.target.value })}
          >
            {ESCOLES_OPTIONS.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Curs escolar actual */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-curs">Curs acadèmic actual *</label>
          <select
            id="nen-curs"
            className="form-select"
            value={formData.curs}
            onChange={(e) => setFormData({ ...formData, curs: e.target.value })}
          >
            {CURSOS_OPTIONS.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botó de continuació al pas 2 */}
      <div className="step-actions-footer">
        <button
          type="submit"
          className="btn-hero-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          id="btn-step1-continuar"
        >
          <span>Continuar a Dades de Contacte</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step1StudentData;
