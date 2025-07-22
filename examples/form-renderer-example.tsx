import { FormRenderer, type FormExportData } from '@flowcsolutions/react-form-builder';
import '@flowcsolutions/react-form-builder/style.css';

// Example FormExportData structure with proper metadata
const formConfig: FormExportData = {
  metadata: {
    id: "my-form-123",
    title: "Sample Contact Form",
    description: "A simple contact form example",
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    builderVersion: "1.1.12"
  },
  settings: {
    submitButtonText: "Submit Form",
    redirectUrl: "",
    emailNotifications: [],
    allowMultipleSubmissions: true,
    requireAuth: false,
    captchaEnabled: false,
    theme: 'auto'
  },
  layout: {
    rows: [
      {
        id: "row-0",
        fields: ["field-header"],
        columns: 1
      },
      {
        id: "row-1",
        fields: ["field-1", "field-2"],
        columns: 2
      },
      {
        id: "row-2", 
        fields: ["field-3"],
        columns: 1
      }
    ],
    totalFields: 4
  },
  fields: [
    {
      id: "field-header",
      type: "header",
      label: "Contact Information Form",
      required: false,
      properties: {
        description: "Please provide your contact details below. All fields marked with * are required.",
        titleClasses: "text-4xl font-black text-purple-800",
        descriptionClasses: "text-lg text-gray-600",
        containerClasses: "bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-purple-200",
        // Layout properties to test
        alignment: "text-center",
        marginTop: "mt-8",
        marginBottom: "mb-6",
        padding: "p-4"
      },
      layout: {
        columnSpan: 12,
        rowId: "row-0",
        gridClass: "col-span-12"
      }
    },
    {
      id: "field-1",
      type: "text",
      label: "First Name",
      placeholder: "Enter your first name",
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      styling: {
        labelColor: "text-gray-900",
        textColor: "text-gray-900",
        backgroundColor: "bg-white",
        borderColor: "border-gray-300",
        fontSize: "text-base",
        fontWeight: "font-normal",
        textAlign: "left"
      },
      span: 6
    },
    {
      id: "field-2", 
      type: "text",
      label: "Last Name",
      placeholder: "Enter your last name",
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      styling: {
        labelColor: "text-gray-900",
        textColor: "text-gray-900", 
        backgroundColor: "bg-white",
        borderColor: "border-gray-300",
        fontSize: "text-base",
        fontWeight: "font-normal",
        textAlign: "left"
      },
      span: 6
    },
    {
      id: "field-3",
      type: "email",
      label: "Email Address", 
      placeholder: "Enter your email",
      required: true,
      validation: {
        required: true,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      },
      styling: {
        labelColor: "text-gray-900",
        textColor: "text-gray-900",
        backgroundColor: "bg-white", 
        borderColor: "border-gray-300",
        fontSize: "text-base",
        fontWeight: "font-normal",
        textAlign: "left"
      },
      span: 12
    }
  ],
  fieldMap: {
    "field-header": {
      id: "field-header",
      type: "header",
      label: "Contact Information Form",
      properties: {
        description: "Please provide your contact details below. All fields marked with * are required.",
        titleClasses: "text-4xl font-black text-purple-800 text-center mb-4",
        descriptionClasses: "text-lg text-gray-600 text-center",
        containerClasses: "bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-purple-200"
      },
      span: 12
    },
    "field-1": {
      id: "field-1",
      type: "text",
      label: "First Name",
      placeholder: "Enter your first name",
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      styling: {
        labelColor: "text-gray-900",
        textColor: "text-gray-900",
        backgroundColor: "bg-white",
        borderColor: "border-gray-300",
        fontSize: "text-base",
        fontWeight: "font-normal",
        textAlign: "left"
      },
      span: 6
    },
    "field-2": {
      id: "field-2",
      type: "text", 
      label: "Last Name",
      placeholder: "Enter your last name",
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      styling: {
        labelColor: "text-gray-900",
        textColor: "text-gray-900",
        backgroundColor: "bg-white",
        borderColor: "border-gray-300", 
        fontSize: "text-base",
        fontWeight: "font-normal",
        textAlign: "left"
      },
      span: 6
    },
    "field-3": {
      id: "field-3",
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      required: true,
      validation: {
        required: true,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      },
      styling: {
        labelColor: "text-gray-900",
        textColor: "text-gray-900",
        backgroundColor: "bg-white",
        borderColor: "border-gray-300",
        fontSize: "text-base", 
        fontWeight: "font-normal",
        textAlign: "left"
      },
      span: 12
    }
  },
  validation: {
    requiredFields: ["field-1", "field-2", "field-3"],
    totalRequiredFields: 3
  }
};

export default function App() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <FormRenderer 
          formConfig={formConfig} 
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        />
      </div>
    </div>
  );
}
