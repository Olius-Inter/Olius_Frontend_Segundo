import type { ReactNode } from 'react';
import type { Driver, DriverFormMode, DriverFormValues } from './driver';

export interface DriverFormProps {
  mode: DriverFormMode;
  initialValues: DriverFormValues;
  driver?: Driver;
}

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}

export interface FormFeedbackProps {
  checked: boolean;
  valid: boolean;
}

export interface PageHeadingProps {
  title: string;
  description: string;
}
