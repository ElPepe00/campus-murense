// frontend/src/pages/public/registration/Step1StudentData.tsx
import React, { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import type { DadesNenForm, SexeType, TallaCamisetaType } from '../../../types/inscripcio';

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

const TALLES_ROBA: { val: TallaCamisetaType; label: string }[] = [
  { val: '4-6', label: 'Talla 4-6 anys' },
  { val: '8-10', label: 'Talla 8-10 anys' },
  { val: '12', label: 'Talla 12 anys' },
  { val: '14', label: 'Talla 14 anys' },
  { val: 'S', label: 'Talla S' },
  { val: 'M', label: 'Talla M' },
];

/**
 * Pas 1 de la inscripció: Dades personals de l'infant segons l'especificació oficial.
 */
export const Step1StudentData: React.FC<Step1StudentDataProps> = ({ initialData, onNext }) => {
  const [formData, setFormData] = useState<DadesNenForm>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSexeChange = (sexe: SexeType) => {
    setFormData((prev) => ({ ...prev, sexe }));
  };

  const handleDataNaixementChange = (dataStr: string) => {
    let calculatedAge: number | string = formData.edat;
    if (dataStr) {
      try {
        const parts = dataStr.split('-');
        if (parts.length === 3) {
          const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age >= 3 && age <= 18) {
            calculatedAge = age;
          }
        }
      } catch {
        // fallback
      }
    }
    setFormData((prev) => ({
      ...prev,
      dataNaixement: dataStr,
      edat: calculatedAge,
    }));
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "El nom de l'infant és obligatori";
    }
    if (!formData.cognoms.trim()) {
      newErrors.cognoms = 'Els cognoms són obligatoris';
    }
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI del jugador/a és obligatori';
    }
    if (!formData.dataNaixement) {
      newErrors.dataNaixement = 'La data de naixement és obligatòria';
    }
    if (!formData.edat || Number(formData.edat) < 3) {
      newErrors.edat = "Indica l'edat de l'infant";
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
        <h2 className="step-card-title">1 - Inscripcions al Campus: Dades Personals</h2>
        <p className="step-card-subtitle">
          Introdueix les dades personals de l'infant per formalitzar el seu registre al Campus C.D. Murense.
        </p>
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

        {/* DNI del jugador/a */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-dni">DNI / NIE del jugador/a *</label>
          <input
            id="nen-dni"
            type="text"
            className={`form-input ${errors.dni ? 'input-error' : ''}`}
            placeholder="Ex: 43219876A"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            required
          />
          {errors.dni && <span className="error-text">{errors.dni}</span>}
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
              onChange={(e) => handleDataNaixementChange(e.target.value)}
              required
            />
            <Calendar size={18} className="input-right-icon" />
          </div>
          {errors.dataNaixement && <span className="error-text">{errors.dataNaixement}</span>}
        </div>

        {/* Edat del jugador/a */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-edat">Edat del jugador/a (anys) *</label>
          <input
            id="nen-edat"
            type="number"
            min="3"
            max="18"
            className={`form-input ${errors.edat ? 'input-error' : ''}`}
            placeholder="Ex: 10"
            value={formData.edat}
            onChange={(e) => setFormData({ ...formData, edat: e.target.value ? parseInt(e.target.value) : '' })}
            required
          />
          {errors.edat && <span className="error-text">{errors.edat}</span>}
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

        {/* Població */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-poblacio">Població *</label>
          <input
            id="nen-poblacio"
            type="text"
            className="form-input"
            placeholder="Ex: Muro"
            value={formData.poblacio}
            onChange={(e) => setFormData({ ...formData, poblacio: e.target.value })}
            required
          />
        </div>

        {/* Club de Procedència */}
        <div className="form-group">
          <label className="form-label" htmlFor="nen-club">Club de Procedència *</label>
          <input
            id="nen-club"
            type="text"
            className="form-input"
            placeholder="Ex: C.D. MURENSE"
            value={formData.clubProcedencia}
            onChange={(e) => setFormData({ ...formData, clubProcedencia: e.target.value })}
            required
          />
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

        {/* 3 - ROBA: Talla de Camiseta Oficial */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="nen-talla">
            3 - Roba: Talla de Camiseta oficial (elegir una opció) *
          </label>
          <select
            id="nen-talla"
            className="form-select"
            value={formData.tallaRoba}
            onChange={(e) => setFormData({ ...formData, tallaRoba: e.target.value as TallaCamisetaType })}
          >
            {TALLES_ROBA.map((t) => (
              <option key={t.val} value={t.val}>
                {t.val} ({t.label})
              </option>
            ))}
          </select>
        </div>

        {/* Al·lèrgies */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="nen-alergies">Al·lèrgies (opcional)</label>
          <input
            id="nen-alergies"
            type="text"
            className="form-input"
            placeholder="Ex: Fruits secs, pol·len, penicil·lina... o 'Cap'"
            value={formData.alergies || ''}
            onChange={(e) => setFormData({ ...formData, alergies: e.target.value })}
          />
        </div>

        {/* Malalties a tenir en compte */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="nen-malalties">Malalties a tenir en compte (opcional)</label>
          <input
            id="nen-malalties"
            type="text"
            className="form-input"
            placeholder="Ex: Asma estacional, diabetis, medicació puntual... o 'Cap'"
            value={formData.malalties || ''}
            onChange={(e) => setFormData({ ...formData, malalties: e.target.value })}
          />
        </div>
      </div>

      {/* Botó de continuació al pas 2 */}
      <div className="step-actions-footer">
        <div></div>
        <button
          type="submit"
          className="btn-step-next"
          id="btn-step1-continuar"
        >
          <span>Continuar a Dades del Tutor</span>
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
};

export default Step1StudentData;
