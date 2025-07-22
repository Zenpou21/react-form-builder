import React, { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Switch,
  Select,
  SelectItem,
  Button,
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import { Plus, Trash2, Settings, Layout } from "lucide-react";
import { useFormBuilder } from "../context/FormBuilderContext";
import type { FormField, Option } from "../types/form";

export function PropertiesPanel() {
  const { state } = useFormBuilder();
  const { selectedFieldId, currentForm } = state;

  const selectedField = currentForm.fields.find(
    (field) => field.id === selectedFieldId
  );

  if (!selectedField) {
    return (
      <div className="w-full bg-background border-l border-divider h-full mt-1 sm:mt-2 p-1 sm:p-2">
        <Card radius="sm" className="py-4 sm:py-10">
          <CardBody className="text-center py-2 sm:py-4">
            <Settings className="text-lg sm:text-2xl text-default-400 mx-auto mb-1 sm:mb-2" />
            <h3 className="text-xs font-semibold mb-1 hidden sm:block">
              No Field Selected
            </h3>
            <h3 className="text-xs font-semibold mb-1 sm:hidden">
              Select Field
            </h3>
            <p className="text-default-600 text-xs hidden sm:block">
              Select a field to edit properties
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full bg-background border-l border-divider h-full overflow-y-auto">
      <div className="p-2">
        <h2 className="text-sm font-semibold mb-2">Properties</h2>

        <Tabs aria-label="Properties" variant="underlined" size="sm">
          <Tab key="basic" title="Basic">
            <MemoizedBasicProperties field={selectedField} />
          </Tab>
          <Tab key="layout" title="Layout">
            <MemoizedLayoutProperties field={selectedField} />
          </Tab>
          <Tab key="custom" title="Custom">
            <MemoizedCustomProperties field={selectedField} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

function BasicProperties({ field }: { field: FormField }) {
  const { actions } = useFormBuilder();

  const updateField = (updates: Partial<FormField>) => {
    actions.updateField(field.id, updates);
  };

  const updateProperties = (updates: any) => {
    actions.updateFieldProperties(field.id, updates);
  };

  const updateAdvanced = (updates: Partial<FormField["advanced"]>) => {
    actions.updateFieldAdvanced(field.id, updates);
  };

  return (
    <div className="space-y-2 pt-2">
      <Input
        key={`label-${field.id}`}
        label="Label"
        value={field.label}
        onValueChange={(value) => updateField({ label: value })}
        size="sm"
      />

      <Input
        key={`name-${field.id}`}
        label="Field Name"
        placeholder="e.g., first_name, email, age"
        value={field.name || ""}
        onValueChange={(value) => updateField({ name: value })}
        size="sm"
        description="Used as the key in form submissions"
      />

      {!["section", "paragraph", "header"].includes(field.type) && (
        <Input
          key={`placeholder-${field.id}`}
          label="Placeholder"
          value={field.placeholder || ""}
          onValueChange={(value) => updateField({ placeholder: value })}
          size="sm"
        />
      )}

      {/* Description field for HeroUI description prop */}
      {!["section", "paragraph", "header"].includes(field.type) && (
        <Input
          key={`description-${field.id}`}
          label="Description"
          placeholder="e.g. We'll never share your email with anyone else."
          value={field.properties?.description || ""}
          onValueChange={(value) => updateProperties({ description: value })}
          size="sm"
          description="Helper text shown below the input field"
        />
      )}

      {/* Description field for static content fields (header, paragraph, image) */}
      {["header", "paragraph", "image"].includes(field.type) && (
        <Textarea
          key={`description-${field.id}`}
          label={field.type === "header" ? "Header Description (Optional)" : field.type === "paragraph" ? "Paragraph Content" : "Image Description"}
          placeholder={field.type === "header" ? "Enter header description or subtitle..." : field.type === "paragraph" ? "Enter paragraph content..." : "Enter image description..."}
          value={field.properties?.description || ""}
          onValueChange={(value: string) => updateProperties({ description: value })}
          size="sm"
          rows={3}
          description={field.type === "header" ? "Add a subtitle or description below your header" : field.type === "paragraph" ? "The main content text for your paragraph" : "Description or caption for the image"}
        />
      )}

      {/* Image-specific fields */}
      {field.type === "image" && (
        <>
          <Input
            key={`imageUrl-${field.id}`}
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={field.properties?.imageUrl || ""}
            onValueChange={(value) => updateProperties({ imageUrl: value })}
            size="sm"
            description="The URL of the image to display"
          />
          
          <Input
            key={`altText-${field.id}`}
            label="Alt Text (Accessibility)"
            placeholder="Describe the image for screen readers"
            value={field.properties?.altText || ""}
            onValueChange={(value) => updateProperties({ altText: value })}
            size="sm"
            description="Alternative text for accessibility (required for screen readers)"
          />
          
          <Input
            key={`maxHeight-${field.id}`}
            label="Max Height"
            placeholder="e.g., 400px, 100%, auto"
            value={field.properties?.maxHeight || ""}
            onValueChange={(value) => updateProperties({ maxHeight: value })}
            size="sm"
            description="Maximum height for the image"
          />
        </>
      )}

      {/* Add Read Only and Disabled for input fields */}
      {(field.type === "text" ||
        field.type === "email" ||
        field.type === "password" ||
        field.type === "number" ||
        field.type === "phone" ||
        field.type === "url" ||
        field.type === "date" ||
        field.type === "time" ||
        field.type === "datetime" ||
        field.type === "calendar" ||
        field.type === "textarea" ||
        field.type === "select" ||
        field.type === "multiselect" ||
        field.type === "autocomplete" ||
        field.type === "search" ||
        field.type === "file" ||
        field.type === "rating" ||
        field.type === "range" ||
        field.type === "rich-text" ||
        field.type === "number-format" ||
        field.type === "pattern-format") && (
        <div className="space-y-2 border-t border-divider pt-2">
          <h5 className="text-xs font-medium text-default-600">Field State</h5>

          <div className="flex flex-col gap-1">
            <Switch
              key={`required-${field.id}`}
              isSelected={field.required}
              onValueChange={(checked) => updateField({ required: checked })}
              size="sm"
            >
              Required
            </Switch>
            <Switch
              key={`readonly-${field.id}`}
              isSelected={field.advanced?.readOnly || false}
              onValueChange={(checked) => updateAdvanced({ readOnly: checked })}
              size="sm"
            >
              Read Only
            </Switch>

            <Switch
              key={`disabled-${field.id}`}
              isSelected={field.advanced?.disabled || false}
              onValueChange={(checked) => updateAdvanced({ disabled: checked })}
              size="sm"
            >
              Disabled
            </Switch>
          </div>
        </div>
      )}

      {/* Color and Size Settings for input fields */}
      {(field.type === "text" ||
        field.type === "email" ||
        field.type === "password" ||
        field.type === "number" ||
        field.type === "phone" ||
        field.type === "url" ||
        field.type === "date" ||
        field.type === "time" ||
        field.type === "datetime" ||
        field.type === "calendar" ||
        field.type === "textarea" ||
        field.type === "select" ||
        field.type === "multiselect" ||
        field.type === "autocomplete" ||
        field.type === "search" ||
        field.type === "file" ||
        field.type === "range") && (
        <div className="space-y-2 border-t border-divider pt-2">
          <h5 className="text-xs font-medium text-default-600">Appearance</h5>

          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Color"
              selectedKeys={[field.properties?.colorVariant || "default"]}
              onSelectionChange={(keys) => {
                const color = Array.from(keys)[0] as string;
                updateProperties({ colorVariant: color });
              }}
              size="sm"
            >
              <SelectItem key="default">Default</SelectItem>
              <SelectItem key="primary">Primary</SelectItem>
              <SelectItem key="secondary">Secondary</SelectItem>
              <SelectItem key="success">Success</SelectItem>
              <SelectItem key="warning">Warning</SelectItem>
              <SelectItem key="danger">Danger</SelectItem>
            </Select>

            <Select
              label="Size"
              selectedKeys={[field.properties?.size || "md"]}
              onSelectionChange={(keys) => {
                const size = Array.from(keys)[0] as string;
                updateProperties({ size: size });
              }}
              size="sm"
            >
              <SelectItem key="sm">Small</SelectItem>
              <SelectItem key="md">Medium</SelectItem>
              <SelectItem key="lg">Large</SelectItem>
            </Select>
          </div>

          <Select
            label="Border Radius"
            selectedKeys={[field.properties?.borderRadius || "md"]}
            onSelectionChange={(keys) => {
              const radius = Array.from(keys)[0] as string;
              updateProperties({ borderRadius: radius });
            }}
            size="sm"
          >
            <SelectItem key="none">None</SelectItem>
            <SelectItem key="sm">Small</SelectItem>
            <SelectItem key="md">Medium</SelectItem>
            <SelectItem key="lg">Large</SelectItem>
            <SelectItem key="full">Full</SelectItem>
          </Select>
        </div>
      )}

      {/* Color and Appearance for buttons and interactive elements */}
      {(field.type === "button" ||
        field.type === "switch" ||
        field.type === "checkbox" ||
        field.type === "radio") && (
        <div className="space-y-2 border-t border-divider pt-2">
          <h5 className="text-xs font-medium text-default-600">Appearance</h5>

          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Color"
              selectedKeys={[field.properties?.colorVariant || "default"]}
              onSelectionChange={(keys) => {
                const color = Array.from(keys)[0] as string;
                updateProperties({ colorVariant: color });
              }}
              size="sm"
            >
              <SelectItem key="default">Default</SelectItem>
              <SelectItem key="primary">Primary</SelectItem>
              <SelectItem key="secondary">Secondary</SelectItem>
              <SelectItem key="success">Success</SelectItem>
              <SelectItem key="warning">Warning</SelectItem>
              <SelectItem key="danger">Danger</SelectItem>
            </Select>

            <Select
              label="Size"
              selectedKeys={[field.properties?.size || "md"]}
              onSelectionChange={(keys) => {
                const size = Array.from(keys)[0] as string;
                updateProperties({ size: size });
              }}
              size="sm"
            >
              <SelectItem key="sm">Small</SelectItem>
              <SelectItem key="md">Medium</SelectItem>
              <SelectItem key="lg">Large</SelectItem>
            </Select>
          </div>

          {field.type === "button" && (
            <Select
              label="Variant"
              selectedKeys={[field.properties?.variant || "solid"]}
              onSelectionChange={(keys) => {
                const variant = Array.from(keys)[0] as string;
                updateProperties({ variant: variant });
              }}
              size="sm"
            >
              <SelectItem key="solid">Solid</SelectItem>
              <SelectItem key="bordered">Bordered</SelectItem>
              <SelectItem key="light">Light</SelectItem>
              <SelectItem key="flat">Flat</SelectItem>
              <SelectItem key="faded">Faded</SelectItem>
              <SelectItem key="shadow">Shadow</SelectItem>
              <SelectItem key="ghost">Ghost</SelectItem>
            </Select>
          )}
        </div>
      )}

      {(field.type === "radio" ||
        field.type === "checkbox" ||
        field.type === "select" ||
        field.type === "multiselect") && (
        <MemoizedOptionsEditor field={field} />
      )}

      {field.type === "textarea" && (
        <Input
          key={`rows-${field.id}`}
          type="number"
          label="Rows"
          value={field.properties?.rows?.toString() || "4"}
          onValueChange={(value) =>
            updateProperties({ rows: parseInt(value) || 4 })
          }
          size="sm"
        />
      )}

      {field.type === "rating" && (
        <Input
          key={`max-rating-${field.id}`}
          type="number"
          label="Max Rating"
          value={field.properties?.max?.toString() || "5"}
          onValueChange={(value) =>
            updateProperties({ max: parseInt(value) || 5 })
          }
          size="sm"
        />
      )}

      {field.type === "file" && (
        <>
          <Input
            key={`accept-${field.id}`}
            label="File Types"
            placeholder="e.g., .jpg,.png,.pdf"
            value={field.properties?.accept || ""}
            onValueChange={(value) => updateProperties({ accept: value })}
            size="sm"
          />
          <Switch
            key={`multiple-${field.id}`}
            isSelected={field.properties?.multiple || false}
            onValueChange={(checked) => updateProperties({ multiple: checked })}
            size="sm"
          >
            Multiple Files
          </Switch>
        </>
      )}

      {field.type === "number" && (
        <>
          <Input
            key={`min-${field.id}`}
            type="number"
            label="Min Value"
            value={field.properties?.min?.toString() || ""}
            onValueChange={(value) =>
              updateProperties({ min: value ? parseFloat(value) : undefined })
            }
            size="sm"
          />
          <Input
            key={`max-${field.id}`}
            type="number"
            label="Max Value"
            value={field.properties?.max?.toString() || ""}
            onValueChange={(value) =>
              updateProperties({ max: value ? parseFloat(value) : undefined })
            }
            size="sm"
          />
        </>
      )}
    </div>
  );
}

function OptionsEditor({ field }: { field: FormField }) {
  const { actions } = useFormBuilder();
  const [newOption, setNewOption] = useState({ label: "", value: "" });

  const updateOptions = (options: Option[]) => {
    actions.updateField(field.id, { options });
  };

  const addOption = () => {
    if (newOption.label && newOption.value) {
      const currentOptions = field.options || [];
      updateOptions([...currentOptions, newOption]);
      setNewOption({ label: "", value: "" });
    }
  };

  const removeOption = (index: number) => {
    const currentOptions = field.options || [];
    updateOptions(currentOptions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium">Options</h4>
        <Chip size="sm" variant="flat">
          {field.options?.length || 0}
        </Chip>
      </div>

      {field.options?.map((option, index) => (
        <div
          key={`option-${index}-${field.id}`}
          className="p-2 border border-default-200 rounded space-y-1"
        >
          <Input
            key={`option-label-${index}-${field.id}`}
            size="sm"
            placeholder="Label"
            value={option.label}
            onValueChange={(value) => {
              const currentOptions = field.options || [];
              const updatedOptions = currentOptions.map((opt, i) =>
                i === index ? { ...opt, label: value } : opt
              );
              updateOptions(updatedOptions);
            }}
          />
          <div className="flex gap-1">
            <Input
              key={`option-value-${index}-${field.id}`}
              size="sm"
              placeholder="Value"
              value={option.value}
              onValueChange={(value) => {
                const currentOptions = field.options || [];
                const updatedOptions = currentOptions.map((opt, i) =>
                  i === index ? { ...opt, value: value } : opt
                );
                updateOptions(updatedOptions);
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              color="danger"
              variant="flat"
              isIconOnly
              onPress={() => removeOption(index)}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>
      ))}

      <div className="p-2 border border-dashed border-default-300 rounded space-y-1">
        <Input
          key={`new-option-label-${field.id}`}
          size="sm"
          placeholder="New option label"
          value={newOption.label}
          onValueChange={(value) =>
            setNewOption({ ...newOption, label: value })
          }
        />
        <div className="flex gap-1">
          <Input
            key={`new-option-value-${field.id}`}
            size="sm"
            placeholder="Value"
            value={newOption.value}
            onValueChange={(value) =>
              setNewOption({ ...newOption, value: value })
            }
            className="flex-1"
          />
          <Button
            size="sm"
            color="primary"
            variant="flat"
            isIconOnly
            onPress={addOption}
            isDisabled={!newOption.label || !newOption.value}
          >
            <Plus size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LayoutProperties({ field }: { field: FormField }) {
  const { actions } = useFormBuilder();

  const updateField = (updates: Partial<FormField>) => {
    actions.updateField(field.id, updates);
  };

  const updateProperties = (updates: any) => {
    actions.updateFieldProperties(field.id, updates);
  };

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-xs font-medium text-default-700 flex items-center gap-1">
        <Layout size={12} />
        Layout & Positioning
      </h4>

      {/* Grid Layout */}
      <div className="space-y-2">
        <Select
          label="Column Span"
          selectedKeys={[
            field.layout?.columnSpan?.toString() ||
              field.columnSpan?.toString() ||
              "12",
          ]}
          onSelectionChange={(keys) => {
            const span = parseInt(Array.from(keys)[0] as string);
            updateField({
              columnSpan: span, // For backward compatibility
              layout: {
                ...field.layout,
                columnSpan: span,
                gridClass: `col-span-${span}`,
              },
            });
          }}
          size="sm"
        >
          <SelectItem key="1">1 column (8.33%)</SelectItem>
          <SelectItem key="2">2 columns (16.67%)</SelectItem>
          <SelectItem key="3">3 columns (25%)</SelectItem>
          <SelectItem key="4">4 columns (33.33%)</SelectItem>
          <SelectItem key="5">5 columns (41.67%)</SelectItem>
          <SelectItem key="6">6 columns (50%)</SelectItem>
          <SelectItem key="7">7 columns (58.33%)</SelectItem>
          <SelectItem key="8">8 columns (66.67%)</SelectItem>
          <SelectItem key="9">9 columns (75%)</SelectItem>
          <SelectItem key="10">10 columns (83.33%)</SelectItem>
          <SelectItem key="11">11 columns (91.67%)</SelectItem>
          <SelectItem key="12">12 columns (100%)</SelectItem>
        </Select>

        {/* Orientation for radio and checkbox groups */}
        {(field.type === 'radio' || field.type === 'checkbox') && (
          <Select
            label="Options Layout"
            selectedKeys={[field.properties?.orientation || 'vertical']}
            onSelectionChange={(keys) => {
              const orientation = Array.from(keys)[0] as string;
              updateProperties({ orientation });
            }}
            size="sm"
          >
            <SelectItem key="vertical">Vertical</SelectItem>
            <SelectItem key="horizontal">Horizontal</SelectItem>
          </Select>
        )}

        {/* Component alignment for radio, checkbox, switch, and rating */}
        {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'switch' || field.type === 'rating') && (
          <Select
            label="Alignment"
            selectedKeys={[field.properties?.componentAlignment || 'left']}
            onSelectionChange={(keys) => {
              const componentAlignment = Array.from(keys)[0] as string;
              updateProperties({ componentAlignment });
            }}
            size="sm"
          >
            <SelectItem key="left">Left</SelectItem>
            <SelectItem key="center">Center</SelectItem>
            <SelectItem key="right">Right</SelectItem>
          </Select>
        )}

        <div className="flex justify-start">
          <Switch
            isSelected={field.properties?.startNewRow || false}
            onValueChange={(checked) =>
              updateProperties({ startNewRow: checked })
            }
            size="sm"
          >
            Start New Row
          </Switch>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-2 border-t border-divider pt-2">
        <h5 className="text-xs font-medium text-default-600 text-start">Spacing</h5>

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Margin Top"
            selectedKeys={[field.properties?.marginTop || "mt-0"]}
            onSelectionChange={(keys) => {
              const margin = Array.from(keys)[0] as string;
              updateProperties({ marginTop: margin });
            }}
            size="sm"
          >
            <SelectItem key="mt-0">None (mt-0)</SelectItem>
            <SelectItem key="mt-1">Small (mt-1)</SelectItem>
            <SelectItem key="mt-2">Medium (mt-2)</SelectItem>
            <SelectItem key="mt-4">Default (mt-4)</SelectItem>
            <SelectItem key="mt-6">Large (mt-6)</SelectItem>
            <SelectItem key="mt-8">Extra Large (mt-8)</SelectItem>
          </Select>

          <Select
            label="Margin Bottom"
            selectedKeys={[field.properties?.marginBottom || "mb-0"]}
            onSelectionChange={(keys) => {
              const margin = Array.from(keys)[0] as string;
              updateProperties({ marginBottom: margin });
            }}
            size="sm"
          >
            <SelectItem key="mb-0">None (mb-0)</SelectItem>
            <SelectItem key="mb-1">Small (mb-1)</SelectItem>
            <SelectItem key="mb-2">Medium (mb-2)</SelectItem>
            <SelectItem key="mb-4">Default (mb-4)</SelectItem>
            <SelectItem key="mb-6">Large (mb-6)</SelectItem>
            <SelectItem key="mb-8">Extra Large (mb-8)</SelectItem>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Outer Spacing"
            selectedKeys={[field.properties?.padding || "p-0"]}
            onSelectionChange={(keys) => {
              const padding = Array.from(keys)[0] as string;
              updateProperties({ padding });
            }}
            size="sm"
          >
            <SelectItem key="p-0">None (p-0)</SelectItem>
            <SelectItem key="p-1">Small (p-1)</SelectItem>
            <SelectItem key="p-2">Medium (p-2)</SelectItem>
            <SelectItem key="p-4">Default (p-4)</SelectItem>
            <SelectItem key="p-6">Large (p-6)</SelectItem>
            <SelectItem key="p-8">Extra Large (p-8)</SelectItem>
          </Select>

          {/* Hide text alignment for specific field types that have their own alignment logic */}
          {!['select', 'autocomplete', 'radio', 'checkbox', 'switch', 'date', 'time', 'file', 'rating'].includes(field.type) && (
            <Select
              label="Text Alignment"
              selectedKeys={[field.properties?.alignment || "text-left"]}
              onSelectionChange={(keys) => {
                const alignment = Array.from(keys)[0] as string;
                updateProperties({ alignment });
              }}
              size="sm"
            >
              <SelectItem key="text-left">Left</SelectItem>
              <SelectItem key="text-center">Center</SelectItem>
              <SelectItem key="text-right">Right</SelectItem>
            </Select>
          )}
        </div>
      </div>

      {/* Responsive Settings */}
      <div className="space-y-2 border-t border-divider pt-2">
        <h5 className="text-xs font-medium text-default-600 text-start">Responsive</h5>
        <div className="flex flex-col gap-1">
          <Switch
            isSelected={field.properties?.hideOnMobile || false}
            onValueChange={(checked) =>
              updateProperties({ hideOnMobile: checked })
            }
            size="sm"
          >
            Hide on Mobile
          </Switch>

          <Switch
            isSelected={field.properties?.hideOnTablet || false}
            onValueChange={(checked) =>
              updateProperties({ hideOnTablet: checked })
            }
            size="sm"
          >
            Hide on Tablet
          </Switch>

          <Switch
            isSelected={field.properties?.hideOnDesktop || false}
            onValueChange={(checked) =>
              updateProperties({ hideOnDesktop: checked })
            }
            size="sm"
          >
            Hide on Desktop
          </Switch>
        </div>
      </div>
    </div>
  );
}

// Custom Properties Component
function CustomProperties({ field }: { field: FormField }) {
  const { actions } = useFormBuilder();
  const [newDataKey, setNewDataKey] = useState("");
  const [newDataValue, setNewDataValue] = useState("");

  const updateCustom = (updates: Partial<FormField["custom"]>) => {
    actions.updateFieldCustom(field.id, updates);
  };

  const updateProperties = (updates: any) => {
    actions.updateFieldProperties(field.id, updates);
  };

  const addDataAttribute = () => {
    if (newDataKey && newDataValue) {
      const currentDataAttributes = field.custom?.dataAttributes || {};
      updateCustom({
        dataAttributes: {
          ...currentDataAttributes,
          [newDataKey]: newDataValue,
        },
      });
      setNewDataKey("");
      setNewDataValue("");
    }
  };

  const removeDataAttribute = (key: string) => {
    const currentDataAttributes = field.custom?.dataAttributes || {};
    const newAttributes = { ...currentDataAttributes };
    delete newAttributes[key];
    updateCustom({ dataAttributes: newAttributes });
  };

  return (
    <div className="space-y-4 py-4">
      {/* Header-specific styling properties */}
      {field.type === 'header' && (
        <div className="space-y-3 border-b border-divider pb-4">
          <h5 className="text-xs font-medium text-default-600">Header Styling</h5>
          
          <Input
            key={`titleClasses-${field.id}`}
            label="Header Title CSS Classes"
            placeholder="e.g., text-4xl font-bold text-blue-600"
            value={field.properties?.titleClasses || ""}
            onValueChange={(value: string) => updateProperties({ titleClasses: value })}
            size="sm"
            description="Tailwind classes for the header title styling"
          />
          
          <Input
            key={`descriptionClasses-${field.id}`}
            label="Header Description CSS Classes"
            placeholder="e.g., text-lg text-gray-600 italic"
            value={field.properties?.descriptionClasses || ""}
            onValueChange={(value: string) => updateProperties({ descriptionClasses: value })}
            size="sm"
            description="Tailwind classes for the header description styling"
          />
          
          <Input
            key={`containerClasses-${field.id}`}
            label="Header Container CSS Classes"
            placeholder="e.g., bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
            value={field.properties?.containerClasses || ""}
            onValueChange={(value: string) => updateProperties({ containerClasses: value })}
            size="sm"
            description="Tailwind classes for the header container styling"
          />
          
          <div className="space-y-2">
            <h6 className="text-xs font-medium text-gray-700">Quick Presets</h6>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => updateProperties({ 
                  titleClasses: "text-4xl font-bold text-gray-900",
                  descriptionClasses: "text-lg text-gray-600",
                  containerClasses: ""
                })}
              >
                Default
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                onPress={() => updateProperties({ 
                  titleClasses: "text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600",
                  descriptionClasses: "text-xl text-gray-500 font-light",
                  containerClasses: "py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                })}
              >
                Gradient
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={() => updateProperties({ 
                  titleClasses: "text-3xl font-semibold text-green-800 uppercase tracking-wide",
                  descriptionClasses: "text-base text-green-600",
                  containerClasses: "py-4 bg-green-50 border-l-4 border-green-500"
                })}
              >
                Success
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => updateProperties({ 
                  titleClasses: "text-2xl font-bold text-red-800",
                  descriptionClasses: "text-sm text-red-600 font-medium",
                  containerClasses: "py-3 bg-red-50 border border-red-200 rounded"
                })}
              >
                Alert
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h5 className="text-xs font-medium text-default-600">HeroUI ClassNames</h5>
        
        <div className="space-y-2 border-t border-divider pt-2">
          <div className="text-xs text-default-500 font-medium">Layout & Structure</div>
          
          <Input
            key={`classnames-base-${field.id}`}
            label="Base (Outer Container)"
            placeholder="e.g. p-4 bg-gray-50 rounded-lg"
            value={field.properties?.classNames?.base || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  base: value 
                } 
              });
            }}
            size="sm"
            description="Outer wrapper container"
          />

          <Input
            key={`classnames-mainwrapper-${field.id}`}
            label="Main Wrapper"
            placeholder="e.g. flex flex-col gap-2"
            value={field.properties?.classNames?.mainWrapper || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  mainWrapper: value 
                } 
              });
            }}
            size="sm"
            description="Main wrapper around input elements"
          />

          <Input
            key={`classnames-innerwrapper-${field.id}`}
            label="Inner Wrapper"
            placeholder="e.g. relative flex items-center"
            value={field.properties?.classNames?.innerWrapper || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  innerWrapper: value 
                } 
              });
            }}
            size="sm"
            description="Inner wrapper around input field"
          />
        </div>

        <div className="space-y-2 border-t border-divider pt-2">
          <div className="text-xs text-default-500 font-medium">Input Elements</div>
          
          <Input
            key={`classnames-inputwrapper-${field.id}`}
            label="Input Wrapper"
            placeholder="e.g. border border-red-500 shadow-lg"
            value={field.properties?.classNames?.inputWrapper || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  inputWrapper: value 
                } 
              });
            }}
            size="sm"
            description="Input border, background, and styling"
          />

          <Input
            key={`classnames-input-${field.id}`}
            label="Input Field"
            placeholder="e.g. text-lg font-bold text-blue-600"
            value={field.properties?.classNames?.input || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  input: value 
                } 
              });
            }}
            size="sm"
            description="Text styling for input content"
          />

          <Input
            key={`classnames-clearbutton-${field.id}`}
            label="Clear Button"
            placeholder="e.g. text-gray-400 hover:text-red-500"
            value={field.properties?.classNames?.clearButton || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  clearButton: value 
                } 
              });
            }}
            size="sm"
            description="Clear button styling"
          />
        </div>

        <div className="space-y-2 border-t border-divider pt-2">
          <div className="text-xs text-default-500 font-medium">Labels & Text</div>
          
          <Input
            key={`classnames-label-${field.id}`}
            label="Label"
            placeholder="e.g. text-sm font-semibold text-purple-700"
            value={field.properties?.classNames?.label || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  label: value 
                } 
              });
            }}
            size="sm"
            description="Field label styling"
          />

          <Input
            key={`classnames-description-${field.id}`}
            label="Description/Helper"
            placeholder="e.g. text-xs text-gray-500 italic"
            value={field.properties?.classNames?.description || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  description: value 
                } 
              });
            }}
            size="sm"
            description="Help text styling"
          />

          <Input
            key={`classnames-helperwrapper-${field.id}`}
            label="Helper Wrapper"
            placeholder="e.g. mt-1 flex justify-between"
            value={field.properties?.classNames?.helperWrapper || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  helperWrapper: value 
                } 
              });
            }}
            size="sm"
            description="Wrapper for helper text and validation"
          />

          <Input
            key={`classnames-errormessage-${field.id}`}
            label="Error Message"
            placeholder="e.g. text-red-500 text-xs font-medium"
            value={field.properties?.classNames?.errorMessage || ""}
            onValueChange={(value) => {
              const currentClassNames = field.properties?.classNames || {};
              updateProperties({ 
                classNames: { 
                  ...currentClassNames, 
                  errorMessage: value 
                } 
              });
            }}
            size="sm"
            description="Error message styling"
          />
        </div>

        <div className="flex gap-2 pt-2 border-t border-divider">
          <Button
            size="sm"
            variant="flat"
            onPress={() => {
              updateProperties({ classNames: undefined });
            }}
          >
            Clear All
          </Button>
          
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={() => {
              updateProperties({ 
                classNames: {
                  base: "p-4",
                  inputWrapper: "border-2 border-primary-300 hover:border-primary-500",
                  input: "text-primary-700 font-medium",
                  label: "text-primary-600 font-semibold",
                  description: "text-primary-400"
                }
              });
            }}
          >
            Example Style
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-divider pt-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-medium text-default-600">
            Data Attributes
          </h5>
          <Button
            size="sm"
            variant="flat"
            onPress={() => {
              updateCustom({
                dataAttributes: {
                  ...field.custom?.dataAttributes,
                  'field-type': field.type,
                  'field-name': field.name || field.label.toLowerCase().replace(/\s+/g, '-')
                }
              });
            }}
          >
            Add Defaults
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            key={`new-data-key-${field.id}`}
            placeholder="e.g. analytics-event"
            value={newDataKey}
            onValueChange={setNewDataKey}
            size="sm"
            className="flex-1"
          />
          <Input
            key={`new-data-value-${field.id}`}
            placeholder="e.g. form-submit"
            value={newDataValue}
            onValueChange={setNewDataValue}
            size="sm"
            className="flex-1"
          />
          <Button
            size="sm"
            variant="flat"
            onPress={addDataAttribute}
            isIconOnly
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1">
          {Object.entries(field.custom?.dataAttributes || {}).map(
            ([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-default-100 p-2 rounded text-xs"
              >
                <span>
                  <strong>{key}:</strong> {value}
                </span>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => removeDataAttribute(key)}
                  isIconOnly
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-divider pt-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-medium text-default-600">Accessibility</h5>
          <Button
            size="sm"
            variant="flat"
            onPress={() => {
              updateCustom({
                role: field.type === 'button' ? 'button' : 
                      field.type === 'select' || field.type === 'multiselect' ? 'combobox' :
                      field.type === 'radio' ? 'radiogroup' :
                      field.type === 'checkbox' ? 'checkbox' : 'textbox',
                tabIndex: 0
              });
            }}
          >
            Add Defaults
          </Button>
        </div>

        <Input
          key={`tab-index-${field.id}`}
          label="Tab Index"
          type="number"
          value={field.custom?.tabIndex?.toString() || ""}
          onValueChange={(value) =>
            updateCustom({ tabIndex: parseInt(value) || undefined })
          }
          size="sm"
          placeholder="0 for normal tab order, -1 to skip"
        />

        <Input
          key={`role-${field.id}`}
          label="ARIA Role"
          placeholder="textbox, button, combobox, etc."
          value={field.custom?.role || ""}
          onValueChange={(value) => updateCustom({ role: value })}
          size="sm"
          description="Override the default ARIA role for this element"
        />
      </div>
    </div>
  );
}

// Schema Properties Component
// Memoized versions to prevent unnecessary re-renders
const MemoizedBasicProperties = React.memo(BasicProperties);
const MemoizedLayoutProperties = React.memo(LayoutProperties);
const MemoizedCustomProperties = React.memo(CustomProperties);
const MemoizedOptionsEditor = React.memo(OptionsEditor);
