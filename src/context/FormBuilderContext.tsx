import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { FormConfig, FormField, FormSettings } from '../types/form';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate unique field names with auto-numbering
function generateUniqueFieldName(field: FormField, existingFields: FormField[]): string {
  // If field already has a name, use it
  if (field.name && field.name.trim()) {
    return field.name;
  }

  // Generate base name from field type
  const baseName = field.type.replace(/[-_]/g, '_').toLowerCase();
  
  // Check if base name already exists
  const existingNames = existingFields.map(f => f.name).filter(Boolean);
  
  if (!existingNames.includes(baseName)) {
    return baseName;
  }
  
  // Find the next available number
  let counter = 2;
  let uniqueName = `${baseName}${counter}`;
  
  while (existingNames.includes(uniqueName)) {
    counter++;
    uniqueName = `${baseName}${counter}`;
  }
  
  return uniqueName;
}

interface FormBuilderState {
  currentForm: FormConfig;
  selectedFieldId: string | null;
  previewMode: boolean;
  deviceView: 'desktop' | 'tablet' | 'mobile';
}

type FormBuilderAction =
  | { type: 'SET_FORM'; payload: FormConfig }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'ADD_FIELD_AT_POSITION'; payload: { field: FormField; position: number } }
  | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<FormField> } }
  | { type: 'UPDATE_FIELD_PROPERTIES'; payload: { id: string; properties: any } }
  | { type: 'UPDATE_FIELD_ADVANCED'; payload: { id: string; advanced: any } }
  | { type: 'UPDATE_FIELD_CUSTOM'; payload: { id: string; custom: any } }
  | { type: 'UPDATE_FIELD_EVENTS'; payload: { id: string; events: any } }
  | { type: 'UPDATE_FIELD_SCHEMA'; payload: { id: string; schema: any } }
  | { type: 'UPDATE_FIELD_LAYOUT'; payload: { id: string; layout: any } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_DEVICE_VIEW'; payload: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'UPDATE_FORM_SETTINGS'; payload: Partial<FormSettings> }
  | { type: 'UPDATE_FORM_META'; payload: { title?: string; description?: string } };

const initialState: FormBuilderState = {
  currentForm: {
    id: uuidv4(),
    title: 'New Form',
    description: '',
    fields: [],
    settings: {
      submitButtonText: 'Submit',
      allowMultipleSubmissions: true,
      requireAuth: false,
      captchaEnabled: false,
      theme: 'auto'
    }
  },
  selectedFieldId: null,
  previewMode: false,
  deviceView: 'desktop'
};

function formBuilderReducer(state: FormBuilderState, action: FormBuilderAction): FormBuilderState {
  switch (action.type) {
    case 'SET_FORM':
      return {
        ...state,
        currentForm: action.payload,
        selectedFieldId: null
      };

    case 'ADD_FIELD':
      const fieldWithUniqueName = {
        ...action.payload,
        name: generateUniqueFieldName(action.payload, state.currentForm.fields)
      };
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: [...state.currentForm.fields, fieldWithUniqueName]
        },
        selectedFieldId: action.payload.id
      };

    case 'ADD_FIELD_AT_POSITION':
      const fieldWithUniqueNameAtPosition = {
        ...action.payload.field,
        name: generateUniqueFieldName(action.payload.field, state.currentForm.fields)
      };
      const newFields = [...state.currentForm.fields];
      newFields.splice(action.payload.position, 0, fieldWithUniqueNameAtPosition);
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: newFields
        },
        selectedFieldId: action.payload.field.id
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? {
                  ...field,
                  ...action.payload.updates,
                  // Deep merge nested objects to prevent component remounting
                  properties: action.payload.updates.properties
                    ? { ...field.properties, ...action.payload.updates.properties }
                    : field.properties,
                  advanced: action.payload.updates.advanced
                    ? { ...field.advanced, ...action.payload.updates.advanced }
                    : field.advanced,
                  custom: action.payload.updates.custom
                    ? { ...field.custom, ...action.payload.updates.custom }
                    : field.custom,
                  events: action.payload.updates.events
                    ? { ...field.events, ...action.payload.updates.events }
                    : field.events,
                  schema: action.payload.updates.schema
                    ? { ...field.schema, ...action.payload.updates.schema }
                    : field.schema,
                  layout: action.payload.updates.layout
                    ? { ...field.layout, ...action.payload.updates.layout }
                    : field.layout
                }
              : field
          )
        }
      };

    case 'UPDATE_FIELD_PROPERTIES':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, properties: { ...field.properties, ...action.payload.properties } }
              : field
          )
        }
      };

    case 'UPDATE_FIELD_ADVANCED':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, advanced: { ...field.advanced, ...action.payload.advanced } }
              : field
          )
        }
      };

    case 'UPDATE_FIELD_CUSTOM':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, custom: { ...field.custom, ...action.payload.custom } }
              : field
          )
        }
      };

    case 'UPDATE_FIELD_EVENTS':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, events: { ...field.events, ...action.payload.events } }
              : field
          )
        }
      };

    case 'UPDATE_FIELD_SCHEMA':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, schema: { ...field.schema, ...action.payload.schema } }
              : field
          )
        }
      };

    case 'UPDATE_FIELD_LAYOUT':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, layout: { ...field.layout, ...action.payload.layout } }
              : field
          )
        }
      };

    case 'DELETE_FIELD':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.filter(field => field.id !== action.payload)
        },
        selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId
      };

    case 'REORDER_FIELDS':
      const fields = [...state.currentForm.fields];
      const [removed] = fields.splice(action.payload.oldIndex, 1);
      fields.splice(action.payload.newIndex, 0, removed);
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields
        }
      };

    case 'SELECT_FIELD':
      return {
        ...state,
        selectedFieldId: action.payload
      };

    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        previewMode: action.payload,
        selectedFieldId: action.payload ? null : state.selectedFieldId
      };

    case 'SET_DEVICE_VIEW':
      return {
        ...state,
        deviceView: action.payload
      };

    case 'UPDATE_FORM_SETTINGS':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          settings: {
            ...state.currentForm.settings,
            ...action.payload
          }
        }
      };

    case 'UPDATE_FORM_META':
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          title: action.payload.title ?? state.currentForm.title,
          description: action.payload.description ?? state.currentForm.description
        }
      };

    default:
      return state;
  }
}

interface FormBuilderContextType {
  state: FormBuilderState;
  dispatch: React.Dispatch<FormBuilderAction>;
  actions: {
    setForm: (form: FormConfig) => void;
    addField: (field: FormField) => void;
    addFieldAtPosition: (field: FormField, position: number) => void;
    updateField: (id: string, updates: Partial<FormField>) => void;
    updateFieldProperties: (id: string, properties: any) => void;
    updateFieldAdvanced: (id: string, advanced: any) => void;
    updateFieldCustom: (id: string, custom: any) => void;
    updateFieldEvents: (id: string, events: any) => void;
    updateFieldSchema: (id: string, schema: any) => void;
    updateFieldLayout: (id: string, layout: any) => void;
    deleteField: (id: string) => void;
    reorderFields: (oldIndex: number, newIndex: number) => void;
    selectField: (id: string | null) => void;
    setPreviewMode: (enabled: boolean) => void;
    setDeviceView: (view: 'desktop' | 'tablet' | 'mobile') => void;
    updateFormSettings: (settings: Partial<FormSettings>) => void;
    updateFormMeta: (meta: { title?: string; description?: string }) => void;
  };
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);

  const actions = {
    setForm: (form: FormConfig) => dispatch({ type: 'SET_FORM', payload: form }),
    addField: (field: FormField) => dispatch({ type: 'ADD_FIELD', payload: field }),
    addFieldAtPosition: (field: FormField, position: number) => 
      dispatch({ type: 'ADD_FIELD_AT_POSITION', payload: { field, position } }),
    updateField: (id: string, updates: Partial<FormField>) => 
      dispatch({ type: 'UPDATE_FIELD', payload: { id, updates } }),
    updateFieldProperties: (id: string, properties: any) => 
      dispatch({ type: 'UPDATE_FIELD_PROPERTIES', payload: { id, properties } }),
    updateFieldAdvanced: (id: string, advanced: any) => 
      dispatch({ type: 'UPDATE_FIELD_ADVANCED', payload: { id, advanced } }),
    updateFieldCustom: (id: string, custom: any) => 
      dispatch({ type: 'UPDATE_FIELD_CUSTOM', payload: { id, custom } }),
    updateFieldEvents: (id: string, events: any) => 
      dispatch({ type: 'UPDATE_FIELD_EVENTS', payload: { id, events } }),
    updateFieldSchema: (id: string, schema: any) => 
      dispatch({ type: 'UPDATE_FIELD_SCHEMA', payload: { id, schema } }),
    updateFieldLayout: (id: string, layout: any) => 
      dispatch({ type: 'UPDATE_FIELD_LAYOUT', payload: { id, layout } }),
    deleteField: (id: string) => dispatch({ type: 'DELETE_FIELD', payload: id }),
    reorderFields: (oldIndex: number, newIndex: number) => 
      dispatch({ type: 'REORDER_FIELDS', payload: { oldIndex, newIndex } }),
    selectField: (id: string | null) => dispatch({ type: 'SELECT_FIELD', payload: id }),
    setPreviewMode: (enabled: boolean) => dispatch({ type: 'SET_PREVIEW_MODE', payload: enabled }),
    setDeviceView: (view: 'desktop' | 'tablet' | 'mobile') => 
      dispatch({ type: 'SET_DEVICE_VIEW', payload: view }),
    updateFormSettings: (settings: Partial<FormSettings>) => 
      dispatch({ type: 'UPDATE_FORM_SETTINGS', payload: settings }),
    updateFormMeta: (meta: { title?: string; description?: string }) => 
      dispatch({ type: 'UPDATE_FORM_META', payload: meta })
  };

  return (
    <FormBuilderContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
}
