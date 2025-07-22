import type { FormConfig } from '../types/form';
import { groupFieldsIntoRows, getFieldSpan } from './layoutUtils';

export interface FormExportData {
  metadata: {
    id: string;
    title: string;
    description?: string;
    version: string;
    createdAt: string;
    exportedAt: string;
    builderVersion: string;
  };
  settings: {
    submitButtonText: string;
    redirectUrl?: string;
    emailNotifications?: string[];
    allowMultipleSubmissions: boolean;
    requireAuth: boolean;
    captchaEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  layout: {
    rows: FormRowExport[];
    totalFields: number;
  };
  fields: FormFieldExport[];
  fieldMap: Record<string, FormFieldExport>;
  validation: {
    requiredFields: string[];
    fieldsWithValidation: string[];
  };
}

export interface FormRowExport {
  id: string;
  fields: string[]; // Array of field IDs
  columns: number; // Total columns used in this row
}

export interface FormFieldExport {
  id: string;
  type: string;
  label: string;
  name?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  validation?: Array<{
    type: string;
    value?: any;
    message: string;
  }>;
  options?: Array<{
    label: string;
    value: string;
  }>;
  properties: {
    helpText?: string;
    description?: string;
    customClasses?: string;
    classNames?: {
      base?: string;
      label?: string;
      inputWrapper?: string;
      innerWrapper?: string;
      mainWrapper?: string;
      input?: string;
      clearButton?: string;
      helperWrapper?: string;
      description?: string;
      errorMessage?: string;
    };
    width?: string;
    rows?: number;
    multiple?: boolean;
    accept?: string;
    min?: number;
    max?: number;
    step?: number;
    startNewRow?: boolean;
    size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
    disabled?: boolean;
    readonly?: boolean;
    hidden?: boolean;
    colorVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    borderRadius?: 'none' | 'small' | 'default' | 'large' | 'full' | 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
    showCharacterCount?: boolean;
    minLength?: number;
    maxLength?: number;
    // Layout properties
    marginTop?: string; // Tailwind classes like 'mt-0', 'mt-1', 'mt-2', 'mt-4', 'mt-6', 'mt-8'
    marginBottom?: string; // Tailwind classes like 'mb-0', 'mb-1', 'mb-2', 'mb-4', 'mb-6', 'mb-8'
    padding?: string; // Tailwind classes like 'p-0', 'p-1', 'p-2', 'p-4', 'p-6', 'p-8'
    alignment?: string; // Tailwind classes like 'text-left', 'text-center', 'text-right', 'text-justify'
    orientation?: 'vertical' | 'horizontal'; // Layout orientation for radio and checkbox groups
    componentAlignment?: 'left' | 'center' | 'right'; // Unified alignment for labels and components in radio, checkbox, switch, and rating
    // Responsive properties
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    hideOnDesktop?: boolean;
    // Custom attributes
    dataAttributes?: string;
    ariaLabel?: string;
    tabIndex?: number;
    // Header-specific styling properties
    titleClasses?: string; // CSS classes for header title
    descriptionClasses?: string; // CSS classes for header description
    containerClasses?: string; // CSS classes for header container
  };
  layout: {
    columnSpan: number;
    rowId: string;
    gridClass: string;
  };
  conditionalLogic?: {
    field: string;
    operator: string;
    value: any;
    action: string;
  };
}

export function generateFormExportData(form: FormConfig): FormExportData {
  const rows = groupFieldsIntoRows(form.fields);
  const now = new Date().toISOString();
  
  // Generate unique names for fields that don't have them
  const fieldsWithNames = form.fields.map((field, index) => {
    if (field.name && field.name.trim()) {
      return field;
    }
    
    // Generate unique name based on type and existing names
    const baseName = field.type.replace(/[-_]/g, '_').toLowerCase();
    const existingNames = form.fields
      .slice(0, index)
      .map(f => f.name)
      .filter(Boolean);
    
    let uniqueName = baseName;
    if (existingNames.includes(baseName)) {
      let counter = 2;
      uniqueName = `${baseName}${counter}`;
      while (existingNames.includes(uniqueName)) {
        counter++;
        uniqueName = `${baseName}${counter}`;
      }
    }
    
    return {
      ...field,
      name: uniqueName
    };
  });
  
  // Process rows for export (use original fields for row mapping)
  const exportRows: FormRowExport[] = rows.map(row => ({
    id: row.id,
    fields: row.fields.map(field => field.id),
    columns: row.fields.reduce((total, field) => total + getFieldSpan(field), 0)
  }));

  // Process fields for export
  const exportFields: FormFieldExport[] = fieldsWithNames.map(field => {
    const span = getFieldSpan(field);
    const rowId = rows.find(row => row.fields.some(f => f.id === field.id))?.id || 'row-0';
    
    return {
      id: field.id,
      type: field.type,
      label: field.label,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      defaultValue: field.defaultValue,
      validation: field.validation,
      options: field.options,
      properties: {
        helpText: field.properties?.helpText,
        description: field.properties?.description,
        customClasses: field.properties?.customClasses || field.custom?.cssClasses?.join(' ') || '',
        classNames: field.properties?.classNames,
        width: field.properties?.width || 'full',
        rows: field.properties?.rows,
        multiple: field.properties?.multiple,
        accept: field.properties?.accept,
        min: field.properties?.min,
        max: field.properties?.max,
        step: field.properties?.step,
        startNewRow: field.properties?.startNewRow,
        size: field.properties?.size,
        disabled: field.advanced?.disabled || field.properties?.disabled,
        readonly: field.advanced?.readOnly || field.properties?.readonly,
        hidden: field.advanced?.hidden || field.properties?.hidden,
        colorVariant: field.properties?.colorVariant,
        borderRadius: field.properties?.borderRadius,
        variant: field.properties?.variant,
        showCharacterCount: field.properties?.showCharacterCount,
        minLength: field.properties?.minLength,
        maxLength: field.properties?.maxLength,
        // Layout properties
        marginTop: field.properties?.marginTop,
        marginBottom: field.properties?.marginBottom,
        padding: field.properties?.padding,
        alignment: field.properties?.alignment,
        orientation: field.properties?.orientation,
        componentAlignment: field.properties?.componentAlignment,
        // Responsive properties
        hideOnMobile: field.properties?.hideOnMobile,
        hideOnTablet: field.properties?.hideOnTablet,
        hideOnDesktop: field.properties?.hideOnDesktop,
        // Custom attributes
        dataAttributes: field.properties?.dataAttributes,
        ariaLabel: field.properties?.ariaLabel,
        tabIndex: field.properties?.tabIndex,
        // Header-specific CSS classes
        titleClasses: field.properties?.titleClasses,
        descriptionClasses: field.properties?.descriptionClasses,
        containerClasses: field.properties?.containerClasses,
      },
      layout: {
        columnSpan: field.columnSpan || span,
        rowId: rowId,
        gridClass: getGridClassName(field.columnSpan || span),
      },
      conditionalLogic: field.conditionalLogic,
    };
  });

  // Create field map for easy lookup
  const fieldMap: Record<string, FormFieldExport> = {};
  exportFields.forEach(field => {
    fieldMap[field.id] = field;
  });

  // Validation summary
  const requiredFields = exportFields.filter(field => field.required).map(field => field.id);
  const fieldsWithValidation = exportFields
    .filter(field => field.validation && field.validation.length > 0)
    .map(field => field.id);

  return {
    metadata: {
      id: form.id,
      title: form.title,
      description: form.description,
      version: '1.0.0',
      createdAt: form.id, // Using ID as creation timestamp for now
      exportedAt: now,
      builderVersion: '1.0.0',
    },
    settings: form.settings,
    layout: {
      rows: exportRows,
      totalFields: exportFields.length,
    },
    fields: exportFields,
    fieldMap,
    validation: {
      requiredFields,
      fieldsWithValidation,
    },
  };
}

function getGridClassName(span: number): string {
  const gridClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  };
  
  return gridClasses[span] || 'col-span-12';
}

export function downloadFormAsJson(form: FormConfig, filename?: string) {
  const exportData = generateFormExportData(form);
  const jsonString = JSON.stringify(exportData, null, 2);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${form.title.replace(/\s+/g, '_')}_form_export.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Utility function to generate form preview JSON (for embedding in preview mode)
export function generateFormPreviewJson(form: FormConfig): string {
  const exportData = generateFormExportData(form);
  return JSON.stringify(exportData, null, 2);
}
