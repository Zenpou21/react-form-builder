export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  name?: string; // Field name for form submission (e.g., "first_name", "email")
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  options?: Option[];
  properties?: FieldProperties;
  conditionalLogic?: ConditionalLogic;
  rowId?: string; // For grouping fields into rows
  columnSpan?: number; // 1-12 for grid system
  layout?: {
    columnSpan?: number; // Width (X-axis): 1-12 grid columns
    rowSpan?: number; // Height (Y-axis): how many rows the element spans
    rowId?: string;
    gridClass?: string;
    startNewRow?: boolean; // Whether this element should start a new row
    width?: string; // CSS width (%, px, rem, etc.)
    height?: string; // CSS height (px, rem, auto, etc.)
    minWidth?: string; // Minimum width
    maxWidth?: string; // Maximum width
    minHeight?: string; // Minimum height
    maxHeight?: string; // Maximum height
  };
  
  // Advanced Properties (matching formengine.io)
  advanced?: AdvancedProperties;
  custom?: CustomProperties;
  events?: EventProperties;
  schema?: SchemaProperties;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'url' | 'min_length' | 'max_length' | 'min_value' | 'max_value';
  value?: any;
  message: string;
}

// Advanced Properties Interface (matching formengine.io structure)
export interface AdvancedProperties {
  // Data binding and value handling
  valued?: boolean;
  valueType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  dataBindingType?: 'none' | 'oneWay' | 'twoWay';
  uncontrolledValue?: any;
  
  // Component behavior
  calculable?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  
  // Validation configuration
  validationRules?: string[];
  customValidators?: string[];
  asyncValidation?: boolean;
  deferFieldCalculation?: boolean;
  
  // Localization
  localizable?: boolean;
  localizationKey?: string;
  
  // Component binding
  bindingTypes?: Record<string, 'none' | 'oneWay' | 'twoWay'>;
}

// Custom Properties Interface (for custom styling and data attributes)
export interface CustomProperties {
  // Custom CSS classes and styling
  cssClasses?: string[];
  customStyles?: Record<string, string>;
  wrapperCss?: Record<string, string>;
  
  // Data attributes
  dataAttributes?: Record<string, string>;
  
  // Accessibility
  ariaAttributes?: Record<string, string>;
  tabIndex?: number;
  role?: string;
  
  // Custom behavior
  customProps?: Record<string, any>;
  componentConfig?: Record<string, any>;
  
  // Templates and presets
  templateName?: string;
  presetConfig?: string;
}

// Event Properties Interface (for event handling)
export interface EventProperties {
  // Form events
  onInit?: string;
  onLoad?: string;
  onSubmit?: string;
  onValidate?: string;
  onError?: string;
  
  // Field events
  onChange?: string;
  onFocus?: string;
  onBlur?: string;
  onClick?: string;
  onKeyPress?: string;
  onKeyDown?: string;
  onKeyUp?: string;
  
  // Custom events
  customEvents?: Record<string, string>;
  
  // Event configuration
  debounceDelay?: number;
  throttleDelay?: number;
  preventDefaults?: string[];
  stopPropagation?: string[];
}

// Schema Properties Interface (for form structure and metadata)
export interface SchemaProperties {
  // Component metadata
  componentKind?: 'component' | 'repeater' | 'template' | 'structure';
  category?: string;
  icon?: string;
  typeName?: string;
  
  // Form structure
  nestingLevel?: number;
  parentComponent?: string;
  childComponents?: string[];
  
  // Validation schema
  validationSchema?: Record<string, any>;
  errorMessages?: Record<string, string>;
  
  // Data schema
  dataSchema?: Record<string, any>;
  defaultProperties?: Record<string, any>;
  
  // Designer metadata
  insertRestriction?: string;
  customPreview?: string;
  builderOnly?: boolean;
}

export interface Option {
  label: string;
  value: string;
}

export interface FieldProperties {
  helpText?: string;
  description?: string;
  customClasses?: string;
  classNames?: Partial<Record<'base' | 'label' | 'inputWrapper' | 'innerWrapper' | 'mainWrapper' | 'input' | 'clearButton' | 'helperWrapper' | 'description' | 'errorMessage', string>>;
  width?: string; // CSS width (%, px, rem, auto, full, half, third, quarter, etc.)
  height?: string; // CSS height (px, rem, auto, etc.)
  minWidth?: string; // Minimum width
  maxWidth?: string; // Maximum width
  minHeight?: string; // Minimum height
  maxHeight?: string; // Maximum height
  rows?: number; // for textarea
  multiple?: boolean; // for select
  accept?: string; // for file upload
  min?: number;
  max?: number;
  step?: number;
  startNewRow?: boolean; // Force this field to start a new row
  columnSpan?: number; // Grid column span (1-12)
  rowSpan?: number; // Grid row span (1-6)
  
  // Custom field type for extensibility
  customType?: string;
  
  // Conditional Logic
  conditional?: boolean;
  conditionalField?: string;
  conditionalOperator?: 'equals' | 'not_equals' | 'contains' | 'empty' | 'not_empty';
  conditionalValue?: string;
  
  // Text Properties
  showCharacterCount?: boolean;
  minLength?: number;
  maxLength?: number;
  
  // Layout Properties
  marginTop?: string; // Tailwind classes like 'mt-0', 'mt-1', 'mt-2', 'mt-4', 'mt-6', 'mt-8'
  marginBottom?: string; // Tailwind classes like 'mb-0', 'mb-1', 'mb-2', 'mb-4', 'mb-6', 'mb-8'
  padding?: string; // Tailwind classes like 'p-0', 'p-1', 'p-2', 'p-4', 'p-6', 'p-8'
  alignment?: string; // Tailwind classes like 'text-left', 'text-center', 'text-right', 'text-justify'
  orientation?: 'vertical' | 'horizontal'; // Layout orientation for radio and checkbox groups
  componentAlignment?: 'left' | 'center' | 'right'; // Unified alignment for labels and components in radio, checkbox, switch, and rating
  
  // Image Properties
  imageUrl?: string; // URL for image fields
  altText?: string; // Alt text for image accessibility
  
  // Responsive Properties
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  
  // Custom Styling
  dataAttributes?: string;
  ariaLabel?: string;
  tabIndex?: number;
  colorVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'small' | 'default' | 'large' | 'full' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  
  // Header-specific styling properties
  titleClasses?: string; // CSS classes for header title
  descriptionClasses?: string; // CSS classes for header description
  containerClasses?: string; // CSS classes for header container
  
  // Advanced Options
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
}

export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'require';
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
}

export interface FormSettings {
  submitButtonText: string;
  redirectUrl?: string;
  emailNotifications?: string[];
  allowMultipleSubmissions: boolean;
  requireAuth: boolean;
  captchaEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export type FormFieldType = 
  // Fields components (based on formengine.io)
  | 'text'           // Input component
  | 'textarea'       // Text area
  | 'email'          // Email input
  | 'number'         // Number input
  | 'password'       // Password input
  | 'phone'          // Phone input (pattern format)
  | 'url'            // URL input
  | 'date'           // Date picker
  | 'datetime'       // Date time picker
  | 'time'           // Time picker
  | 'calendar'       // Calendar component
  | 'checkbox'       // Checkbox
  | 'radio'          // Radio group
  | 'select'         // Dropdown (InputPicker)
  | 'multiselect'    // Tag picker
  | 'switch'         // Switch component
  | 'autocomplete'   // AutoComplete component
  | 'search'         // Search component
  | 'file'           // Uploader component
  | 'signature'      // Signature component (paid feature)
  | 'rating'         // Rating component
  | 'range'          // Range/Slider component
  | 'rich-text'      // Rich text editor
  | 'number-format'  // Number format component
  | 'pattern-format' // Pattern format component
  
  // Static components (based on formengine.io)
  | 'button'         // Button component
  | 'label'          // Label component
  | 'header'         // Header (h1-h6)
  | 'paragraph'      // Static content/span
  | 'image'          // Image component
  | 'message'        // Message component
  | 'progress-line'  // Progress line
  | 'progress-circle'// Progress circle
  | 'tooltip'        // Tooltip component
  | 'qr-code'        // QR code component (paid feature)
  | 'html'           // Custom HTML content
  
  // Structure components (based on formengine.io)
  | 'container'      // Container (div)
  | 'card'           // Card/Panel component
  | 'tab'            // Tab component
  | 'breadcrumb'     // Breadcrumb component
  | 'section'        // Section divider
  | 'pagebreak'      // Page break
  | 'repeater'       // Repeater component (paid feature)
  
  // Template components (based on formengine.io)
  | 'slot'           // Slot component
  | 'template'       // Template component
  
  // Error components
  | 'error-message'; // Error message component

export interface DragItem {
  id: string;
  type: FormFieldType;
  label: string;
  icon: string;
  category: 'fields' | 'static' | 'structure' | 'templates' | 'error';
  description?: string;
  isPaidFeature?: boolean;
  tags?: string[];
}

export interface FormRow {
  id: string;
  fields: FormField[];
}
