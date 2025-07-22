import React, { useState, useCallback } from "react";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  RadioGroup,
  Radio,
  Switch,
  Button,
  Card,
  CardBody,
  CardHeader,
  Slider,
  Chip,
  Divider,
} from "@heroui/react";
import { Star, Upload } from "lucide-react";
import { SignaturePad } from "./SignaturePad";
import { buildHeroUIClasses } from "../utils/fieldStyles";
import type { FormExportData, FormFieldExport } from "../utils/formExport";

interface FormRendererProps {
  formConfig: FormExportData;
  onSubmit?: (data: Record<string, any>) => void;
  className?: string;
}

export function FormRenderer({
  formConfig,
  onSubmit,
  className = "",
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[fieldId]) {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check required fields
    formConfig.validation.requiredFields.forEach((fieldId) => {
      const field = formConfig.fieldMap[fieldId];
      const value = formData[fieldId];

      if (!value || (typeof value === "string" && value.trim() === "")) {
        newErrors[fieldId] = `${field.label} is required`;
      }
    });

    // Check field-specific validation
    formConfig.validation.fieldsWithValidation.forEach((fieldId) => {
      const field = formConfig.fieldMap[fieldId];
      const value = formData[fieldId];

      if (field.validation && value) {
        field.validation.forEach((rule) => {
          switch (rule.type) {
            case "email":
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                newErrors[fieldId] = rule.message;
              }
              break;
            case "minLength":
              if (value.length < rule.value) {
                newErrors[fieldId] = rule.message;
              }
              break;
            case "maxLength":
              if (value.length > rule.value) {
                newErrors[fieldId] = rule.message;
              }
              break;
            case "min":
              if (parseFloat(value) < rule.value) {
                newErrors[fieldId] = rule.message;
              }
              break;
            case "max":
              if (parseFloat(value) > rule.value) {
                newErrors[fieldId] = rule.message;
              }
              break;
            case "pattern":
              const regex = new RegExp(rule.value);
              if (!regex.test(value)) {
                newErrors[fieldId] = rule.message;
              }
              break;
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // First pass: generate unique field names for all fields
      const fieldNames = new Map<string, string>();
      const usedNames = new Set<string>();
      
      // Process all fields to assign unique names
      Object.keys(formData).forEach((fieldId) => {
        const field = formConfig.fieldMap[fieldId];
        let fieldName = field.name;
        
        if (!fieldName || !fieldName.trim()) {
          // Generate name from field type, ensuring uniqueness
          const baseName = field.type.replace(/[-_]/g, '_').toLowerCase();
          fieldName = baseName;
          
          if (usedNames.has(fieldName)) {
            let counter = 2;
            fieldName = `${baseName}${counter}`;
            while (usedNames.has(fieldName)) {
              counter++;
              fieldName = `${baseName}${counter}`;
            }
          }
        }
        
        usedNames.add(fieldName);
        fieldNames.set(fieldId, fieldName);
      });

      // Second pass: build submission data using the unique names
      const submissionData: Record<string, any> = {};
      Object.entries(formData).forEach(([fieldId, value]) => {
        const fieldName = fieldNames.get(fieldId)!;
        submissionData[fieldName] = value;
      });

      onSubmit?.(submissionData);
    }
  };

  const renderField = (field: FormFieldExport) => {
    const value = formData[field.id] || field.defaultValue || "";
    const error = errors[field.id];
    const hasError = !!error;

    // Build HeroUI classes using the same system as FormFieldRenderer
    const heroUIClasses = buildHeroUIClasses(field as any, false); // false = not in editor, so apply responsive hiding

    // Apply common properties that work across all components
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder,
      isRequired: field.required,
      description: field.properties?.description,
      classNames: {
        base: heroUIClasses.base,
        label: heroUIClasses.label,
        inputWrapper: heroUIClasses.inputWrapper,
        innerWrapper: heroUIClasses.innerWrapper,
        mainWrapper: heroUIClasses.mainWrapper,
        input: heroUIClasses.input,
        clearButton: heroUIClasses.clearButton,
        helperWrapper: heroUIClasses.helperWrapper,
        description: heroUIClasses.description,
        errorMessage: heroUIClasses.errorMessage,
      },
      // isInvalid: hasError,
      errorMessage: error,
      size: (field.properties.size as "sm" | "md" | "lg") || "md",
      isDisabled: field.properties.disabled,
      isReadOnly: field.properties.readonly,
      color: field.properties.colorVariant as any,
      radius: field.properties.borderRadius as any,
      variant: field.properties.variant as any,
    };

    // Handle conditional display
    if (field.properties.hidden) {
      return null;
    }

    // Generate HTML attributes
    const getFieldAttributes = () => {
      const attributes: Record<string, any> = {};
      
      if (field.properties.ariaLabel) {
        attributes['aria-label'] = field.properties.ariaLabel;
      }
      
      if (field.properties.tabIndex !== undefined) {
        attributes.tabIndex = field.properties.tabIndex;
      }
      
      if (field.properties.dataAttributes) {
        // Parse data attributes like "data-test=value,data-id=123"
        const dataAttrs = field.properties.dataAttributes.split(',');
        dataAttrs.forEach(attr => {
          const [key, value] = attr.split('=');
          if (key && value) {
            attributes[key.trim()] = value.trim();
          }
        });
      }
      
      return attributes;
    };

    const fieldAttributes = getFieldAttributes();

    switch (field.type) {
      case "text":
        return (
          <Input
            key={`text-${field.id}`}
            {...commonProps}
            type="text"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            minLength={field.properties.minLength}
            maxLength={field.properties.maxLength}
          />
        );

      case "email":
        return (
          <Input
            key={`email-${field.id}`}
            {...commonProps}
            type="email"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            minLength={field.properties.minLength}
            maxLength={field.properties.maxLength}
          />
        );

      case "password":
        return (
          <Input
            key={`password-${field.id}`}
            {...commonProps}
            type="password"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            minLength={field.properties.minLength}
            maxLength={field.properties.maxLength}
          />
        );

      case "number":
        return (
          <Input
            key={`number-${field.id}`}
            {...commonProps}
            type="number"
            value={value}
            onValueChange={(val) => {
              // Add client-side min/max validation
              const numVal = parseFloat(val);
              if (!isNaN(numVal)) {
                if (field.properties.min !== undefined && numVal < field.properties.min) {
                  return; // Don't update if below minimum
                }
                if (field.properties.max !== undefined && numVal > field.properties.max) {
                  return; // Don't update if above maximum
                }
              }
              handleFieldChange(field.id, val);
            }}
            min={field.properties.min}
            max={field.properties.max}
            step={field.properties.step}
          />
        );

      case "textarea":
        return (
          <Textarea
            key={`textarea-${field.id}`}
            {...commonProps}
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            rows={field.properties.rows || 4}
            minLength={field.properties.minLength}
            maxLength={field.properties.maxLength}
          />
        );

      case "select":
        return (
          <Select
            {...commonProps}
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0];
              handleFieldChange(field.id, selectedValue);
            }}
            selectionMode={field.properties.multiple ? "multiple" : "single"}
          >
            {field.options?.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            )) || []}
          </Select>
        );

      case "autocomplete":
        return (
          <Autocomplete
            {...commonProps}
            selectedKey={value || ""}
            onSelectionChange={(key) => {
              handleFieldChange(field.id, key);
            }}
            allowsCustomValue
          >
            {field.options?.map((option) => (
              <AutocompleteItem key={option.value}>{option.label}</AutocompleteItem>
            )) || []}
          </Autocomplete>
        );

      case "radio":
        const radioOrientation = field.properties?.orientation || 'vertical';
        const radioComponentAlignment = field.properties?.componentAlignment || 'left';
        
        // Alignment classes based on orientation and alignment preference
        const radioAlignmentClass = radioOrientation === 'horizontal'
          ? (radioComponentAlignment === 'center' ? 'justify-center' : 
             radioComponentAlignment === 'right' ? 'justify-end' : 'justify-start')
          : (radioComponentAlignment === 'center' ? 'items-center' : 
             radioComponentAlignment === 'right' ? 'items-end' : 'items-start');
        
        const radioLabelAlignmentClass = radioComponentAlignment === 'center' ? 'text-center' : 
                                         radioComponentAlignment === 'right' ? 'text-right' : 'text-left';
        
        // Wrapper alignment for the entire component
        const radioWrapperAlignmentClass = radioComponentAlignment === 'center' ? 'flex flex-col items-center' :
                                          radioComponentAlignment === 'right' ? 'flex flex-col items-end' : 
                                          'flex flex-col items-start';
        
        return (
          <div className={radioWrapperAlignmentClass}>
            <RadioGroup
              label={field.label}
              description={field.properties?.description}
              isRequired={field.required}
              value={value}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              isInvalid={hasError}
              errorMessage={error}
              size={(field.properties.size as "sm" | "md" | "lg") || "md"}
              isDisabled={field.properties.disabled}
              color={field.properties.colorVariant as any}
              orientation={radioOrientation as any}
              classNames={{
                base: [
                  field.properties.marginTop,
                  field.properties.marginBottom,
                  field.properties.padding
                ].filter(Boolean).join(' '),
                wrapper: `${field.properties.alignment || ''} ${radioAlignmentClass}`,              label: radioLabelAlignmentClass,
              description: radioLabelAlignmentClass
            }}
            className={field.properties.customClasses}
          >
            {field.options?.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            )) || []}
          </RadioGroup>
          </div>
        );

      case "checkbox":
        if (field.options && field.options.length > 1) {
          const orientation = field.properties?.orientation || 'vertical';
          const componentAlignment = field.properties?.componentAlignment || 'left';
          
          // Container classes based on orientation
          const containerClass = orientation === 'horizontal' 
            ? 'flex flex-wrap gap-4' 
            : 'flex flex-col space-y-2';
            
          // Alignment classes based on orientation and alignment preference
          const alignmentClass = orientation === 'horizontal'
            ? (componentAlignment === 'center' ? 'justify-center' : 
               componentAlignment === 'right' ? 'justify-end' : 'justify-start')
            : (componentAlignment === 'center' ? 'items-center' : 
               componentAlignment === 'right' ? 'items-end' : 'items-start');
          
          const labelAlignmentClass = componentAlignment === 'center' ? 'text-center' : 
                                     componentAlignment === 'right' ? 'text-right' : 'text-left';
          
          // Wrapper alignment for the entire component
          const wrapperAlignmentClass = componentAlignment === 'center' ? 'flex flex-col items-center' :
                                       componentAlignment === 'right' ? 'flex flex-col items-end' : 
                                       'flex flex-col items-start';
          
          return (
            <div className={`space-y-2 ${field.properties.customClasses || ""} ${wrapperAlignmentClass}`}>
              <label className={`text-sm font-medium ${labelAlignmentClass}`}>
                {field.label}
                {field.required && <span className="text-danger">*</span>}
              </label>
              {field.properties?.description && (
                <p className={`text-xs text-default-500 ${labelAlignmentClass}`}>
                  {field.properties?.description}
                </p>
              )}
              <div className={`${containerClass} ${alignmentClass}`}>
                {field.options.map((option) => (
                  <Checkbox
                    key={option.value}
                    isSelected={value?.includes?.(option.value) || false}
                    onValueChange={(checked) => {
                      const currentValues = value || [];
                      if (checked) {
                        handleFieldChange(field.id, [
                          ...currentValues,
                          option.value,
                        ]);
                      } else {
                        handleFieldChange(
                          field.id,
                          currentValues.filter((v: any) => v !== option.value)
                        );
                      }
                    }}
                    size={(field.properties.size as "sm" | "md" | "lg") || "md"}
                    isDisabled={field.properties.disabled}
                    color={field.properties.colorVariant as any}
                    radius={field.properties.borderRadius as any}
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </div>
              {hasError && <p className="text-danger text-xs">{error}</p>}
            </div>
          );
        } else {
          const checkboxComponentAlignment = field.properties?.componentAlignment || 'left';
          const checkboxAlignmentClass = checkboxComponentAlignment === 'center' ? 'justify-center' : 
                                         checkboxComponentAlignment === 'right' ? 'justify-end' : 'justify-start';
          const checkboxLabelAlignmentClass = checkboxComponentAlignment === 'center' ? 'text-center' : 
                                             checkboxComponentAlignment === 'right' ? 'text-right' : 'text-left';
          
          return (
            <div className={`${field.properties.customClasses} ${checkboxAlignmentClass}`}>
              <label className={`text-sm font-medium block mb-2 ${checkboxLabelAlignmentClass}`}>
                {field.label}
                {field.required && <span className="text-danger">*</span>}
              </label>
              {field.properties?.description && (
                <p className={`text-xs text-default-500 mb-2 ${checkboxLabelAlignmentClass}`}>
                  {field.properties?.description}
                </p>
                )}
              <Checkbox
                isSelected={value || false}
                onValueChange={(checked) =>
                  handleFieldChange(field.id, checked)
                }
                size={(field.properties.size as "sm" | "md" | "lg") || "md"}
                isDisabled={field.properties.disabled}
                color={field.properties.colorVariant as any}
                radius={field.properties.borderRadius as any}
              >
                Check to confirm
              </Checkbox>
              {hasError && <p className={`text-danger text-xs mt-1 ${checkboxLabelAlignmentClass}`}>{error}</p>}
            </div>
          );
        }

      case "switch":
        const switchComponentAlignment = field.properties?.componentAlignment || 'left';
        const switchAlignmentClass = switchComponentAlignment === 'center' ? 'flex justify-center' : 
                                     switchComponentAlignment === 'right' ? 'flex justify-end' : 'flex justify-start';
        
        return (
          <div className={`space-y-2 ${field.properties.customClasses || ""}`}>
            <div className={switchAlignmentClass}>
              <Switch
                isSelected={value || false}
                onValueChange={(checked) => handleFieldChange(field.id, checked)}
                size={(field.properties.size as "sm" | "md" | "lg") || "sm"}
                isDisabled={field.properties.disabled}
                color={field.properties.colorVariant as any}
              >
                {field.label}
                {field.required && <span className="text-danger ml-1">*</span>}
              </Switch>
            </div>
            {field.properties?.description && (
              <div className={switchAlignmentClass}>
                <p className="text-xs text-default-500">
                  {field.properties?.description}
                </p>
              </div>
            )}
            {hasError && (
              <div className={switchAlignmentClass}>
                <p className="text-danger text-xs">{error}</p>
              </div>
            )}
          </div>
        );

      case "section":
        return (
          <Card 
            radius={(field.properties.borderRadius as any) || "sm"} 
            className={field.properties.customClasses}
          >
            <CardBody className="py-4">
              <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
              {field.properties?.description && (
                <p className="text-default-600">{field.properties?.description}</p>
              )}
            </CardBody>
          </Card>
        );

      case "header":
        const headerLayoutClasses = [
          field.properties?.marginTop || '',
          field.properties?.marginBottom || '',
          field.properties?.padding || '',
          field.properties?.alignment || ''
        ].filter(Boolean).join(' ');
        
        // Provide default layout values when no properties are set
        const defaultHeaderClasses = (!field.properties?.marginTop && !field.properties?.marginBottom && !field.properties?.padding && !field.properties?.alignment) 
          ? 'my-8 py-6 text-center' 
          : '';
        
        // Use layout padding if specified, otherwise fall back to default py-4
        const defaultContainerClasses = field.properties?.padding ? '' : '';
        const containerClasses = field.properties?.containerClasses || defaultContainerClasses;
        
        // Debug: Log the classes being applied
        console.log('FormRenderer Header Layout Classes:', {
          marginTop: field.properties?.marginTop,
          marginBottom: field.properties?.marginBottom,
          padding: field.properties?.padding,
          alignment: field.properties?.alignment,
          headerLayoutClasses,
          defaultHeaderClasses,
          containerClasses,
          finalClasses: `header-field ${containerClasses} ${headerLayoutClasses} ${defaultHeaderClasses} ${field.properties?.customClasses || ""}`
        });
        
        return (
          <div className={`header-field ${containerClasses} ${headerLayoutClasses} ${defaultHeaderClasses} ${field.properties?.customClasses || ""}`}>
            <h1 className={`${field.properties?.titleClasses || "header-title"} ${!field.properties?.marginTop && !field.properties?.marginBottom ? 'mb-4' : ''}`}>
              {field.label || "Header Title"}
            </h1>
            {field.properties?.description && (
              <p className={`${field.properties?.descriptionClasses || "header-description"} ${!field.properties?.marginTop && !field.properties?.marginBottom ? 'mt-4' : ''}`}>
                {field.properties.description}
              </p>
            )}
          </div>
        );

      case "paragraph":
        const paragraphLayoutClasses = [
          field.properties?.marginTop || '',
          field.properties?.marginBottom || '',
          field.properties?.padding || '',
          field.properties?.alignment || ''
        ].filter(Boolean).join(' ');
        
        // Provide default layout values when no properties are set
        const defaultParagraphClasses = (!field.properties?.marginTop && !field.properties?.marginBottom && !field.properties?.padding && !field.properties?.alignment) 
          ? 'my-3' 
          : '';
        
        return (
          <div className={`paragraph-field ${paragraphLayoutClasses} ${defaultParagraphClasses} ${field.properties?.customClasses || ""}`}>
            {field.label && (
              <h4 className={`paragraph-title ${!field.properties?.marginTop && !field.properties?.marginBottom ? 'mb-1' : ''}`}>{field.label}</h4>
            )}
            {field.properties?.description && (
              <p className="paragraph-description">{field.properties.description}</p>
            )}
          </div>
        );

      case "image":
        const imageLayoutClasses = [
          field.properties?.marginTop || '',
          field.properties?.marginBottom || '',
          field.properties?.padding || '',
          field.properties?.alignment || ''
        ].filter(Boolean).join(' ');
        
        // Provide default layout values when no properties are set
        const defaultImageClasses = (!field.properties?.marginTop && !field.properties?.marginBottom && !field.properties?.padding && !field.properties?.alignment) 
          ? 'my-4 text-center' 
          : '';
        
        // Debug: Log image properties
        console.log('FormRenderer Image Debug:', {
          fieldId: field.id,
          fieldLabel: field.label,
          imageUrl: (field.properties as any)?.imageUrl,
          altText: (field.properties as any)?.altText,
          maxHeight: (field.properties as any)?.maxHeight,
          properties: field.properties
        });
        
        return (
          <div className={`image-field ${imageLayoutClasses} ${defaultImageClasses} ${field.properties?.customClasses || ""}`}>
            {field.label && (
              <h4 className={`image-title ${!field.properties?.marginTop && !field.properties?.marginBottom ? 'mb-2' : ''}`}>{field.label}</h4>
            )}
            <div>
              {(field.properties as any)?.imageUrl ? (
                <img
                  src={(field.properties as any).imageUrl}
                  alt={(field.properties as any)?.altText || field.label || "Image"}
                  className="image-actual"
                  style={{
                    maxHeight: (field.properties as any)?.maxHeight || '400px'
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <div className="text-gray-500">
                    <p>No image URL provided</p>
                    {field.label && <p className="text-sm mt-1">({field.label})</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "phone":
        return (
          <Input
            key={`phone-${field.id}`}
            {...commonProps}
            type="tel"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            minLength={field.properties.minLength}
            maxLength={field.properties.maxLength}
          />
        );

      case "url":
        return (
          <Input
            key={`url-${field.id}`}
            {...commonProps}
            type="url"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            minLength={field.properties.minLength}
            maxLength={field.properties.maxLength}
          />
        );

      case "date":
        return (
          <Input
            key={`date-${field.id}`}
            {...commonProps}
            type="date"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          />
        );

      case "time":
        return (
          <Input
            key={`time-${field.id}`}
            {...commonProps}
            type="time"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          />
        );

      case "datetime":
        return (
          <Input
            key={`datetime-${field.id}`}
            {...commonProps}
            type="datetime-local"
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          />
        );

      case "multiselect":
        return (
          <Select
            {...commonProps}
            selectionMode="multiple"
            selectedKeys={value || []}
            onSelectionChange={(keys) => {
              const selectedValues = Array.from(keys);
              handleFieldChange(field.id, selectedValues);
            }}
          >
            {field.options?.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            )) || []}
          </Select>
        );

      case "range":
        return (
          <div className={`space-y-2 ${field.properties.customClasses || ""}`}>
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-danger">*</span>}
            </label>
            {field.properties?.description && (
              <p className="text-xs text-default-500">
                {field.properties?.description}
              </p>
            )}
            <Slider
              value={value || field.properties.min || 0}
              onChange={(val: number | number[]) => {
                const newValue = Array.isArray(val) ? val[0] : val;
                handleFieldChange(field.id, newValue);
              }}
              minValue={field.properties.min || 0}
              maxValue={field.properties.max || 100}
              step={field.properties.step || 1}
              className="max-w-md"
              size={(field.properties.size as "sm" | "md" | "lg") || "sm"}
              isDisabled={field.properties.disabled}
              color={field.properties.colorVariant as any}
            />
            <div className="text-xs text-default-500">
              Value: {value || field.properties.min || 0}
            </div>
            {hasError && <p className="text-danger text-xs">{error}</p>}
          </div>
        );

      case "file":
        return (
          <div className={`space-y-2 ${field.properties.customClasses || ""}`}>
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-danger">*</span>}
            </label>
            {field.properties?.description && (
              <p className="text-xs text-default-500">
                {field.properties?.description}
              </p>
            )}
            <div className={`border-2 border-dashed border-default-300 rounded-lg p-4 text-center hover:border-default-400 transition-colors ${
              field.properties.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              <Upload className="mx-auto h-8 w-8 text-default-400 mb-2" />
              <input
                type="file"
                accept={field.properties.accept || "*"}
                multiple={field.properties.multiple}
                disabled={field.properties.disabled}
                onChange={(e) => {
                  const files = field.properties.multiple ? Array.from(e.target.files || []) : e.target.files?.[0];
                  handleFieldChange(field.id, files);
                }}
                className="hidden"
                id={`file-${field.id}`}
              />
              <label htmlFor={`file-${field.id}`} className={`cursor-pointer ${field.properties.disabled ? 'cursor-not-allowed' : ''}`}>
                <div className="text-sm text-default-600">
                  Click to upload {field.properties.multiple ? 'files' : 'a file'}
                </div>
                {value && (
                  <div className="mt-2">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((file: any, index: number) => (
                          <Chip key={index} color="primary" size="sm">
                            {file.name || `File ${index + 1}`}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <Chip color="primary" size="sm">
                        {value.name || "File selected"}
                      </Chip>
                    )}
                  </div>
                )}
              </label>
            </div>
            {hasError && <p className="text-danger text-xs">{error}</p>}
          </div>
        );

      case "rating":
        const ratingComponentAlignment = field.properties?.componentAlignment || 'left';
        const ratingAlignmentClass = ratingComponentAlignment === 'center' ? 'flex justify-center' : 
                                     ratingComponentAlignment === 'right' ? 'flex justify-end' : 'flex justify-start';
        
        return (
          <div className={`space-y-2 ${field.properties.customClasses || ""}`}>
            <div className={ratingAlignmentClass}>
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-danger">*</span>}
              </label>
            </div>
            {field.properties?.description && (
              <div className={ratingAlignmentClass}>
                <p className="text-xs text-default-500">
                  {field.properties?.description}
                </p>
              </div>
            )}
            <div className={ratingAlignmentClass}>
              <div className="flex space-x-1">
                {Array.from({ length: field.properties.max || 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={field.properties.disabled}
                    onClick={() => handleFieldChange(field.id, i + 1)}
                    className={`p-1 hover:scale-110 transition-transform ${
                      field.properties.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        (value || 0) > i
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-default-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            {value && (
              <div className={ratingAlignmentClass}>
                <div className="text-sm text-default-600">
                  {value} out of {field.properties.max || 5} stars
                </div>
              </div>
            )}
            {hasError && (
              <div className={ratingAlignmentClass}>
                <p className="text-danger text-xs">{error}</p>
              </div>
            )}
          </div>
        );

      case "signature":
        return (
          <div className={`space-y-2 ${field.properties.customClasses || ""}`}>
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-danger">*</span>}
            </label>
            {field.properties?.description && (
              <p className="text-xs text-default-500">
                {field.properties?.description}
              </p>
            )}
            <SignaturePad
              value={value}
              onChange={(signature) => handleFieldChange(field.id, signature)}
              width={400}
              height={200}
              className="w-full"
              disabled={field.properties.disabled}
            />
            {hasError && <p className="text-danger text-xs">{error}</p>}
          </div>
        );

      case "pagebreak":
        return (
          <div className="py-4">
            <Divider />
          </div>
        );

      case "html":
        return (
          <div className="py-2">
            <div
              dangerouslySetInnerHTML={{
                __html: field.defaultValue || "<div>HTML content</div>",
              }}
              className="prose prose-sm max-w-none"
            />
          </div>
        );

      case "button":
        return (
          <Button
            key={`button-${field.id}`}
            color={field.properties.colorVariant as any}
            size={field.properties.size as any}
            variant={field.properties.variant as any}
            radius={field.properties.borderRadius as any}
            isDisabled={field.properties.disabled}
            className={field.properties.customClasses}
            onPress={() => {
              // Handle button click - could trigger custom events or actions
              console.log('Button clicked:', field.label);
              handleFieldChange(field.id, 'clicked');
            }}
            {...fieldAttributes}
          >
            {field.label}
          </Button>
        );

      default:
        return (
          <div className="p-4 border border-dashed border-default-300 rounded-lg text-center">
            <p className="text-default-500">
              Unsupported field type: {field.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <Card radius="sm" className="p-1">
        <CardHeader>
          <div>
            <h1 className="text-2xl font-bold">{formConfig.metadata.title}</h1>
            {formConfig.metadata.description && (
              <p className="text-default-600 mt-2">
                {formConfig.metadata.description}
              </p>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Render form rows with grid layout */}
            {formConfig.layout.rows.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-4">
                {row.fields.map((fieldId) => {
                  const field = formConfig.fieldMap[fieldId];
                  
                  // Generate responsive hiding classes for the field container
                  const getResponsiveClasses = () => {
                    const classes = [];
                    if (field.properties.hideOnMobile) {
                      classes.push('hidden sm:block');
                    }
                    if (field.properties.hideOnTablet) {
                      classes.push('md:hidden lg:block');
                    }
                    if (field.properties.hideOnDesktop) {
                      classes.push('lg:hidden');
                    }
                    return classes.join(' ');
                  };
                  
                  const responsiveClasses = getResponsiveClasses();
                  
                  return (
                    <div 
                      key={fieldId} 
                      className={`${field.layout.gridClass} ${responsiveClasses}`}
                    >
                      {renderField(field)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-divider">
              <Button
                radius="sm"
                type="submit"
                color="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                {formConfig.settings.submitButtonText}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
