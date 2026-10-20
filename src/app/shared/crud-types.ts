export interface CrudOption {
  value: string | number | boolean | null;
  label: string;
}

export type CrudFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'date'
  | 'time'
  | 'datetime'
  | 'checkbox';

export interface CrudField {
  key: string;
  label: string;
  type?: CrudFieldType;
  required?: boolean;
  options?: CrudOption[];
  multiple?: boolean;
  /** Propiedad del objeto que se usa como valor al precargar un select (ej. idPlace). */
  optionValueKey?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  hint?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  /** Ocupa las dos columnas del formulario. */
  wide?: boolean;
  autocomplete?: string;
}

export type CrudColumnType =
  'text' | 'number' | 'currency' | 'boolean' | 'date' | 'time' | 'datetime' | 'chips' | 'truncate';

export interface CrudColumn {
  key: string;
  label: string;
  type?: CrudColumnType;
  /** Permite calcular el valor mostrado (relaciones, nombres completos, etc.). */
  value?: (row: any) => unknown;
  /** Etiqueta usada cuando type = 'chips' y el valor es un arreglo de objetos. */
  chipLabel?: (item: any) => string;
}

export interface CrudDialogData {
  title: string;
  subtitle?: string;
  fields: CrudField[];
  row?: Record<string, any>;
  isEdit: boolean;
}
