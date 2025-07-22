import type { FormField, FormFieldType, DragItem } from '../types/form';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new form field with default properties
 */
export function createFormField(type: FormFieldType): FormField {
  const baseField = {
    id: uuidv4(),
    type,
    label: getDefaultLabel(type),
    required: false,
    properties: {},
    advanced: {
      valued: true,
      valueType: 'string' as const,
      dataBindingType: 'twoWay' as const,
      calculable: false,
      localizable: false,
      readOnly: false,
      disabled: false,
      asyncValidation: false,
      deferFieldCalculation: false
    },
    layout: {
      columnSpan: 12,
      gridClass: 'col-span-12'
    },
    custom: {
      cssClasses: [],
      dataAttributes: {}
    },
    events: {},
    schema: {
      componentKind: 'component' as const,
      category: getCategoryForType(type),
      typeName: type,
      icon: getIconForType(type),
      nestingLevel: 0,
      builderOnly: false
    }
  };

  // Add type-specific properties
  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'phone':
    case 'url':
      return {
        ...baseField,
        placeholder: `Enter ${baseField.label.toLowerCase()}`,
        properties: {
          ...baseField.properties,
          width: 'full',
          maxLength: 255,
          colorVariant: 'default',
          size: 'md',
          borderRadius: 'md'
        }
      };

    case 'textarea':
      return {
        ...baseField,
        placeholder: `Enter ${baseField.label.toLowerCase()}`,
        properties: {
          ...baseField.properties,
          width: 'full',
          rows: 4,
          maxLength: 1000,
          colorVariant: 'default',
          size: 'md',
          borderRadius: 'md'
        }
      };

    case 'number':
    case 'number-format':
      return {
        ...baseField,
        placeholder: 'Enter number',
        properties: {
          ...baseField.properties,
          width: 'full'
        },
        advanced: {
          ...baseField.advanced,
          valueType: 'number' as const
        }
      };

    case 'select':
    case 'radio':
    case 'checkbox':
    case 'multiselect':
    case 'autocomplete':
      return {
        ...baseField,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ],
        properties: {
          ...baseField.properties,
          width: 'full',
          colorVariant: 'default',
          size: 'md',
          borderRadius: 'md',
          orientation: type === 'radio' || type === 'checkbox' ? 'vertical' : undefined,
          componentAlignment: type === 'radio' || type === 'checkbox' ? 'left' : undefined
        },
        advanced: {
          ...baseField.advanced,
          valueType: type === 'multiselect' || type === 'checkbox' ? 'array' as const : 'string' as const
        }
      };

    case 'date':
    case 'datetime':
    case 'time':
    case 'calendar':
      return {
        ...baseField,
        properties: {
          ...baseField.properties,
          width: 'full'
        },
        advanced: {
          ...baseField.advanced,
          valueType: 'date' as const
        }
      };

    case 'file':
      return {
        ...baseField,
        properties: {
          ...baseField.properties,
          width: 'full',
          accept: '',
          multiple: false
        },
        advanced: {
          ...baseField.advanced,
          valueType: 'array' as const
        }
      };

    case 'rating':
    case 'range':
      return {
        ...baseField,
        properties: {
          ...baseField.properties,
          width: 'full',
          max: 5,
          componentAlignment: type === 'rating' ? 'left' : undefined
        },
        advanced: {
          ...baseField.advanced,
          valueType: 'number' as const
        }
      };

    case 'switch':
      return {
        ...baseField,
        properties: {
          ...baseField.properties,
          width: 'full',
          size: 'md',
          componentAlignment: 'left'
        },
        advanced: {
          ...baseField.advanced,
          valueType: 'boolean' as const
        }
      };

    case 'signature':
      return {
        ...baseField,
        properties: {
          ...baseField.properties,
          width: 'full'
        },
        advanced: {
          ...baseField.advanced,
          valueType: 'string' as const
        }
      };

    // Static content fields
    case 'header':
      return {
        ...baseField,
        label: 'Welcome to Our Form',
        properties: {
          ...baseField.properties,
          width: 'full',
          description: 'Please fill out the information below to get started.'
        },
        advanced: {
          ...baseField.advanced,
          valued: false
        }
      };

    case 'paragraph':
    case 'label':
    case 'message':
      return {
        ...baseField,
        label: 'Paragraph Text',
        properties: {
          ...baseField.properties,
          width: 'full',
          description: 'This is a paragraph of text. You can edit this content in the properties panel to provide instructions, descriptions, or any other information for your form users.'
        },
        advanced: {
          ...baseField.advanced,
          valued: false
        }
      };

    case 'image':
      return {
        ...baseField,
        label: 'Image',
        properties: {
          ...baseField.properties,
          width: 'full',
          imageUrl: '',
          altText: 'Image description',
          maxHeight: '400px',
          description: 'Add an image URL in the properties panel to display an image here.'
        },
        advanced: {
          ...baseField.advanced,
          valued: false
        }
      };

    case 'button':
      return {
        ...baseField,
        label: 'Button',
        properties: {
          ...baseField.properties,
          width: 'full',
          colorVariant: 'primary',
          size: 'md',
          borderRadius: 'md',
          variant: 'solid'
        },
        advanced: {
          ...baseField.advanced,
          valued: false
        }
      };

    // Structure fields
    case 'section':
    case 'pagebreak':
      return {
        ...baseField,
        label: 'Section',
        properties: {
          ...baseField.properties,
          width: 'full'
        },
        advanced: {
          ...baseField.advanced,
          valued: false
        }
      };

    case 'container':
    case 'card':
      return {
        ...baseField,
        label: 'Container',
        properties: {
          ...baseField.properties,
          width: 'full'
        },
        advanced: {
          ...baseField.advanced,
          valued: false
        }
      };

    default:
      return baseField;
  }
}

function getDefaultLabel(type: FormFieldType): string {
  const labels: Record<FormFieldType, string> = {
    // Input fields
    text: 'Text Input',
    email: 'Email',
    password: 'Password',
    number: 'Number',
    phone: 'Phone',
    url: 'URL',
    textarea: 'Text Area',
    
    // Selection fields
    select: 'Select',
    multiselect: 'Multi Select',
    radio: 'Radio Group',
    checkbox: 'Checkbox Group',
    switch: 'Switch',
    autocomplete: 'Auto Complete',
    search: 'Search',
    
    // Date/Time fields
    date: 'Date',
    datetime: 'Date Time',
    time: 'Time',
    calendar: 'Calendar',
    
    // Special fields
    file: 'File Upload',
    rating: 'Rating',
    signature: 'Signature',
    range: 'Range Slider',
    'rich-text': 'Rich Text',
    'number-format': 'Formatted Number',
    'pattern-format': 'Pattern Format',
    
    // Static content
    button: 'Button',
    label: 'Label',
    header: 'Header',
    paragraph: 'Paragraph',
    image: 'Image',
    message: 'Message',
    'progress-line': 'Progress Line',
    'progress-circle': 'Progress Circle',
    tooltip: 'Tooltip',
    'qr-code': 'QR Code',
    html: 'HTML',
    
    // Structure
    container: 'Container',
    card: 'Card',
    tab: 'Tab',
    breadcrumb: 'Breadcrumb',
    section: 'Section',
    pagebreak: 'Page Break',
    repeater: 'Repeater',
    
    // Template fields
    slot: 'Slot',
    template: 'Template',
    
    // Error fields
    'error-message': 'Error Message'
  };
  
  return labels[type] || 'Field';
}

function getCategoryForType(type: FormFieldType): string {
  const categories: Record<FormFieldType, string> = {
    // Input fields
    text: 'fields',
    email: 'fields',
    password: 'fields',
    number: 'fields',
    phone: 'fields',
    url: 'fields',
    textarea: 'fields',
    
    // Selection fields
    select: 'fields',
    multiselect: 'fields',
    radio: 'fields',
    checkbox: 'fields',
    switch: 'fields',
    autocomplete: 'fields',
    search: 'fields',
    
    // Date/Time fields
    date: 'fields',
    datetime: 'fields',
    time: 'fields',
    calendar: 'fields',
    
    // Special fields
    file: 'fields',
    rating: 'fields',
    signature: 'fields',
    range: 'fields',
    'rich-text': 'fields',
    'number-format': 'fields',
    'pattern-format': 'fields',
    
    // Static content
    button: 'static',
    label: 'static',
    header: 'static',
    paragraph: 'static',
    image: 'static',
    message: 'static',
    'progress-line': 'static',
    'progress-circle': 'static',
    tooltip: 'static',
    'qr-code': 'static',
    html: 'static',
    
    // Structure
    container: 'structure',
    card: 'structure',
    tab: 'structure',
    breadcrumb: 'structure',
    section: 'structure',
    pagebreak: 'structure',
    repeater: 'structure',
    
    // Template fields
    slot: 'templates',
    template: 'templates',
    
    // Error fields
    'error-message': 'error'
  };
  
  return categories[type] || 'fields';
}

function getIconForType(type: FormFieldType): string {
  const icons: Record<FormFieldType, string> = {
    // Input fields
    text: 'Type',
    email: 'Mail',
    password: 'Key',
    number: 'Hash',
    phone: 'Phone',
    url: 'Link',
    textarea: 'FileText',
    
    // Selection fields
    select: 'ChevronDown',
    multiselect: 'List',
    radio: 'Circle',
    checkbox: 'Square',
    switch: 'ToggleLeft',
    autocomplete: 'Search',
    search: 'Search',
    
    // Date/Time fields
    date: 'Calendar',
    datetime: 'Clock',
    time: 'Clock',
    calendar: 'Calendar',
    
    // Special fields
    file: 'Upload',
    rating: 'Star',
    signature: 'PenTool',
    range: 'Sliders',
    'rich-text': 'FileText',
    'number-format': 'Hash',
    'pattern-format': 'Hash',
    
    // Static content
    button: 'MousePointer',
    label: 'Tag',
    header: 'Heading',
    paragraph: 'Type',
    image: 'Image',
    message: 'MessageSquare',
    'progress-line': 'TrendingUp',
    'progress-circle': 'Circle',
    tooltip: 'Info',
    'qr-code': 'QrCode',
    html: 'Code',
    
    // Structure
    container: 'Box',
    card: 'Square',
    tab: 'Tabs',
    breadcrumb: 'ChevronRight',
    section: 'Layout',
    pagebreak: 'Scissors',
    repeater: 'Copy',
    
    // Template fields
    slot: 'Grid',
    template: 'FileTemplate',
    
    // Error fields
    'error-message': 'AlertCircle'
  };
  
  return icons[type] || 'Square';
}

/**
 * Field templates for the form builder
 */
export const FIELD_TEMPLATES: Record<FormFieldType, FormField> = {
  // Input fields
  text: createFormField('text'),
  email: createFormField('email'),
  password: createFormField('password'),
  number: createFormField('number'),
  phone: createFormField('phone'),
  url: createFormField('url'),
  textarea: createFormField('textarea'),
  
  // Selection fields
  select: createFormField('select'),
  multiselect: createFormField('multiselect'),
  radio: createFormField('radio'),
  checkbox: createFormField('checkbox'),
  switch: createFormField('switch'),
  autocomplete: createFormField('autocomplete'),
  search: createFormField('search'),
  
  // Date/Time fields
  date: createFormField('date'),
  datetime: createFormField('datetime'),
  time: createFormField('time'),
  calendar: createFormField('calendar'),
  
  // Special fields
  file: createFormField('file'),
  rating: createFormField('rating'),
  signature: createFormField('signature'),
  range: createFormField('range'),
  'rich-text': createFormField('rich-text'),
  'number-format': createFormField('number-format'),
  'pattern-format': createFormField('pattern-format'),
  
  // Static content
  button: createFormField('button'),
  label: createFormField('label'),
  header: createFormField('header'),
  paragraph: createFormField('paragraph'),
  image: createFormField('image'),
  message: createFormField('message'),
  'progress-line': createFormField('progress-line'),
  'progress-circle': createFormField('progress-circle'),
  tooltip: createFormField('tooltip'),
  'qr-code': createFormField('qr-code'),
  html: createFormField('html'),
  
  // Structure
  container: createFormField('container'),
  card: createFormField('card'),
  tab: createFormField('tab'),
  breadcrumb: createFormField('breadcrumb'),
  section: createFormField('section'),
  pagebreak: createFormField('pagebreak'),
  repeater: createFormField('repeater'),
  
  // Template fields
  slot: createFormField('slot'),
  template: createFormField('template'),
  
  // Error fields
  'error-message': createFormField('error-message')
};

/**
 * Drag items for the sidebar (most commonly used components)
 */
export const DRAG_ITEMS: DragItem[] = [
  // Most common input fields
  { id: 'text', type: 'text', label: 'Text Input', icon: 'Type', category: 'fields' },
  { id: 'email', type: 'email', label: 'Email', icon: 'Mail', category: 'fields' },
  { id: 'password', type: 'password', label: 'Password', icon: 'Key', category: 'fields' },
  { id: 'number', type: 'number', label: 'Number', icon: 'Hash', category: 'fields' },
  { id: 'phone', type: 'phone', label: 'Phone', icon: 'Phone', category: 'fields' },
  { id: 'url', type: 'url', label: 'URL', icon: 'Link', category: 'fields' },
  { id: 'textarea', type: 'textarea', label: 'Text Area', icon: 'FileText', category: 'fields' },
  
  // Selection fields
  { id: 'select', type: 'select', label: 'Select', icon: 'ChevronDown', category: 'fields' },
  { id: 'multiselect', type: 'multiselect', label: 'Multi Select', icon: 'List', category: 'fields' },
  { id: 'autocomplete', type: 'autocomplete', label: 'Auto Complete', icon: 'Search', category: 'fields' },
  { id: 'radio', type: 'radio', label: 'Radio Group', icon: 'Circle', category: 'fields' },
  { id: 'checkbox', type: 'checkbox', label: 'Checkbox Group', icon: 'Square', category: 'fields' },
  { id: 'switch', type: 'switch', label: 'Switch', icon: 'ToggleLeft', category: 'fields' },
  
  // Date/Time fields
  { id: 'date', type: 'date', label: 'Date', icon: 'Calendar', category: 'fields' },
  { id: 'time', type: 'time', label: 'Time', icon: 'Clock', category: 'fields' },
  { id: 'datetime', type: 'datetime', label: 'Date & Time', icon: 'CalendarClock', category: 'fields' },
  
  // Special fields
  { id: 'file', type: 'file', label: 'File Upload', icon: 'Upload', category: 'fields' },
  { id: 'rating', type: 'rating', label: 'Rating', icon: 'Star', category: 'fields' },
  { id: 'range', type: 'range', label: 'Range Slider', icon: 'Minus', category: 'fields' },
  { id: 'signature', type: 'signature', label: 'Signature', icon: 'PenTool', category: 'fields' },
  
  // Static content
  { id: 'header', type: 'header', label: 'Header', icon: 'Heading', category: 'static' },
  { id: 'paragraph', type: 'paragraph', label: 'Paragraph', icon: 'Type', category: 'static' },
  { id: 'image', type: 'image', label: 'Image', icon: 'Image', category: 'static' },
  { id: 'button', type: 'button', label: 'Button', icon: 'MousePointer', category: 'static' },
  
  // Structure
  { id: 'section', type: 'section', label: 'Section', icon: 'Layout', category: 'structure' },
  { id: 'container', type: 'container', label: 'Container', icon: 'Box', category: 'structure' },
  { id: 'card', type: 'card', label: 'Card', icon: 'Square', category: 'structure' }
];

/**
 * Field categories for organizing the sidebar
 */
export const FIELD_CATEGORIES = [
  {
    id: 'fields',
    label: 'Form Fields',
    description: 'Input and selection fields'
  },
  {
    id: 'static',
    label: 'Static Content',
    description: 'Text, images, and layout elements'
  },
  {
    id: 'structure',
    label: 'Structure',
    description: 'Containers and layout components'
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Pre-built field combinations'
  },
  {
    id: 'error',
    label: 'Error Handling',
    description: 'Error display components'
  }
];
