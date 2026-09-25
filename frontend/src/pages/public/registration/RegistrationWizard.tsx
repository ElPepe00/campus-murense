// frontend/src/pages/public/registration/RegistrationWizard.tsx
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Step1StudentData } from './Step1StudentData';
import { Step2TutorData } from './Step2TutorData';
import { Step3ServicesData } from './Step3ServicesData';
import { Step4PermissionsData } from './Step4PermissionsData';
import { Step5SummaryData } from './Step5SummaryData';
import type { 
  InscripcioState, 
  DadesNenForm, 
  DadesTutorForm, 
  PersonaAutoritzadaForm, 
  ServeisForm, 
  AutoritzacionsForm 
} from '../../../types/inscripcio';

interface RegistrationWizardProps {
  onCancel: () => void;
  onSuccess: (idInscripcio: number) => void;
}

const INITIAL_NEN: DadesNenForm = {
  nom: '',
  cognoms: '',
  dataNaixement: '',
  sexe: 'nen',
  colegi: 'CEIP Joan Mas (Muro)',
  curs: '4t Primària',
  tallaRoba: '8-10 anys',
  alergies: '',
};

const INITIAL_TUTOR: DadesTutorForm = {
  nomComplet: '',
  email: '',
  telefonPrincipal: '',
  telefonSecundari: '',
  parentiu: 'Mare',
  dni: '',
};

const INITIAL_SERVEIS: ServeisForm = {
  setmanes: [1, 2],
  menjador: false,
  matinera: false,
  piscina: 'SI',
  excursio1: false,
  excursio2: false,
};

const INITIAL_AUTORITZACIONS: AutoritzacionsForm = {
  imatges: true,
  sortides: true,
  sortirSol: false,
};

const STEPS_CONFIG = [
  { num: 1, label: 'Infant' },
  { num: 2, label: 'Tutors' },
  { num: 3, label: 'Serveis' },
  { num: 4, label: 'Permisos' },
  { num: 5, label: 'Confirmació' },
];

/**
 * Assistent complet d'inscripció online (passos 1 a 5) per al Campus C.D. Murense.
 */
export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<InscripcioState>({
    pasActual: 1,
    nen: INITIAL_NEN,
    tutor: INITIAL_TUTOR,
    autoritzats: [] as PersonaAutoritzadaForm[],
    serveis: INITIAL_SERVEIS,
    autoritzacions: INITIAL_AUTORITZACIONS,
  });

  const handleStep1Next = (dadesNen: DadesNenForm) => {
    setFormData((prev) => ({
      ...prev,
      nen: dadesNen,
      pasActual: 2,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = (tutor: DadesTutorForm, autoritzats: PersonaAutoritzadaForm[]) => {
    setFormData((prev) => ({
      ...prev,
      tutor,
      autoritzats,
      pasActual: 3,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3Next = (serveis: ServeisForm) => {
    setFormData((prev) => ({
      ...prev,
      serveis,
      pasActual: 4,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep4Next = (autoritzacions: AutoritzacionsForm) => {
    setFormData((prev) => ({
      ...prev,
      autoritzacions,
      pasActual: 5,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalConfirm = () => {
    onSuccess(1);
  };

  const handleBack = () => {
    if (formData.pasActual > 1) {
      setFormData((prev) => ({ ...prev, pasActual: prev.pasActual - 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  return (
    <div className="wizard-page-container">
      {/* Barra superior de retorn */}
      <div className="wizard-nav-top">
        <button
          type="button"
          className="btn-wizard-back"
          onClick={handleBack}
          aria-label="Tornar enrere"
        >
          <ArrowLeft size={18} />
          <span>{formData.pasActual === 1 ? 'Cancel·lar inscripció' : 'Pas anterior'}</span>
        </button>

        <span className="wizard-step-indicator">
          Pas {formData.pasActual} de {STEPS_CONFIG.length} • {STEPS_CONFIG[formData.pasActual - 1]?.label}
        </span>
      </div>

      {/* Indicador visual de progrés per passos */}
      <div className="wizard-stepper-row">
        {STEPS_CONFIG.map((step) => {
          const isDone = formData.pasActual > step.num;
          const isCurrent = formData.pasActual === step.num;

          return (
            <div
              key={step.num}
              className={`stepper-node ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="stepper-circle">
                {isDone ? <Check size={16} strokeWidth={3} /> : step.num}
              </div>
              <span className="stepper-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Contingut dinàmic de cada pas */}
      <div className="wizard-content-box">
        {formData.pasActual === 1 && (
          <Step1StudentData
            initialData={formData.nen}
            onNext={handleStep1Next}
          />
        )}

        {formData.pasActual === 2 && (
          <Step2TutorData
            initialTutor={formData.tutor}
            initialAutoritzats={formData.autoritzats}
            onBack={handleBack}
            onNext={handleStep2Next}
          />
        )}

        {formData.pasActual === 3 && (
          <Step3ServicesData
            initialServeis={formData.serveis}
            onBack={handleBack}
            onNext={handleStep3Next}
          />
        )}

        {formData.pasActual === 4 && (
          <Step4PermissionsData
            initialPermisos={formData.autoritzacions}
            onBack={handleBack}
            onNext={handleStep4Next}
          />
        )}

        {formData.pasActual === 5 && (
          <Step5SummaryData
            formData={formData}
            onBack={handleBack}
            onConfirm={handleFinalConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationWizard;
