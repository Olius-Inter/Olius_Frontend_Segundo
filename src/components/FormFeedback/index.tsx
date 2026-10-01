import type { FormFeedbackProps } from '../../types/driverForm';

export default function FormFeedback({ checked, valid }: FormFeedbackProps) {
  if (!checked) return null;
  return valid
    ? <div className="feedback success" role="status">Os campos estão válidos. Nenhum dado foi enviado ou salvo.</div>
    : <div className="feedback error" role="alert">Revise os campos indicados antes de continuar.</div>;
}
