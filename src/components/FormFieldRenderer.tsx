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
  Card,
  CardBody,
  Divider,
  DateInput,
  TimeInput,
  Button,
} from "@heroui/react";
import React from "react";
import type { FormField } from "../types/form";
import { Star, Upload, Smartphone, Tablet, Monitor } from "lucide-react";
import { buildHeroUIClasses } from "../utils/fieldStyles";
import { SignaturePad } from "./SignaturePad";

interface FormFieldRendererProps {
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
  isPreview?: boolean;
}

export function FormFieldRenderer({
  field,
  value,
  onChange,
}: FormFieldRendererProps) {
  
  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  // Hide field if conditional logic applies (simplified)
  if (field.advanced?.hidden || field.properties?.hidden) {
    return null;
  }

  // Build HeroUI-specific classes (pass isEditor: true to prevent responsive hiding in editor)
  const heroUIClasses = buildHeroUIClasses(field, true);

  // For complex components that need wrapper divs
  const wrapperClasses = heroUIClasses.base;

  // Generate responsive hide indicators for editor
  const getResponsiveIndicators = () => {
    const indicators = [];
    if (field.properties?.hideOnMobile) {
      indicators.push('Hidden on Mobile');
    }
    if (field.properties?.hideOnTablet) {
      indicators.push('Hidden on Tablet');
    }
    if (field.properties?.hideOnDesktop) {
      indicators.push('Hidden on Desktop');
    }
    return indicators;
  };

  const responsiveIndicators = getResponsiveIndicators();

  // Wrapper component that shows responsive indicators in editor
  const FieldWithIndicators = ({ children }: { children: React.ReactNode }) => {
    if (responsiveIndicators.length === 0) {
      return <>{children}</>;
    }

    return (
      <div className="relative">
        {children}
        <div className="absolute top-0 right-0 flex items-center gap-1 -mt-2 -mr-2 z-10">
          {responsiveIndicators.map((indicator) => (
            <span
              key={indicator}
              className="text-danger-700 text-xs px-1.5 py-0.5 rounded-full "
              title={indicator}
            >
              {indicator.includes('Mobile') ? <Smartphone size={15} /> : indicator.includes('Tablet') ? <Tablet size={15} /> : <Monitor size={15} />}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to wrap any field component with indicators
  const wrapWithIndicators = (component: React.ReactNode) => (
    <FieldWithIndicators>{component}</FieldWithIndicators>
  );

  // Common props for the form components
  const commonProps = {
    label: field.label,
    placeholder: field.placeholder,
    isRequired: field.required,
    description: field.properties?.description,
    isDisabled: field.advanced?.disabled || field.properties?.disabled,
    isReadOnly: field.advanced?.readOnly || field.properties?.readonly,
    size: field.properties?.size as any,
    color: field.properties?.colorVariant as any,
    variant: field.properties?.variant as any,
    radius: field.properties?.borderRadius as any,
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
  };

  // Build HTML attributes for data attributes and accessibility
  const buildHtmlAttributes = () => {
    const attrs: Record<string, any> = {};
    
    // Add data attributes from custom properties
    const dataAttributes = field.custom?.dataAttributes || {};
    Object.entries(dataAttributes).forEach(([key, value]) => {
      attrs[`data-${key}`] = value;
    });
    
    // Add accessibility attributes
    if (field.custom?.role) {
      attrs['role'] = field.custom.role;
    }
    
    if (field.custom?.tabIndex !== undefined) {
      attrs['tabIndex'] = field.custom.tabIndex;
    }
    
    if (field.properties?.ariaLabel) {
      attrs['aria-label'] = field.properties.ariaLabel;
    }
    
    // Add number input specific attributes
    if (field.type === 'number') {
      if (field.properties?.min !== undefined) {
        attrs['min'] = field.properties.min;
      }
      if (field.properties?.max !== undefined) {
        attrs['max'] = field.properties.max;
      }
      if (field.properties?.step !== undefined) {
        attrs['step'] = field.properties.step;
      }
    }
    
    return attrs;
  };

  const htmlAttributes = buildHtmlAttributes();

  // Add character count for text fields
  const getCharacterCount = () => {
    if (
      field.properties?.showCharacterCount &&
      (field.type === "text" || field.type === "textarea")
    ) {
      const currentLength = value ? value.length : 0;
      const maxLength = field.properties?.maxLength;
      return maxLength ? `${currentLength}/${maxLength}` : `${currentLength}`;
    }
    return null;
  };

  const characterCount = getCharacterCount();

  const renderField = () => {
    switch (field.type) {
    case "text":
      return (
        <FieldWithIndicators>
          <Input
            key={`text-${field.id}`}
            {...commonProps}
            {...htmlAttributes}
            type="text"
            value={value || ""}
            onValueChange={(val) => handleChange(val)}
            maxLength={field.properties?.maxLength}
          />
          {characterCount && (
            <div className="text-xs text-default-500 mt-1 text-right">
              {characterCount}
            </div>
          )}
        </FieldWithIndicators>
      );

    case "email":
      return (
        <FieldWithIndicators>
          <Input
            key={`email-${field.id}`}
            {...commonProps}
            {...htmlAttributes}
            type="email"
            value={value || ""}
            onValueChange={(val) => handleChange(val)}
          />
        </FieldWithIndicators>
      );

    case "password":
      return (
        <FieldWithIndicators>
          <Input
            key={`password-${field.id}`}
            {...commonProps}
            {...htmlAttributes}
            type="password"
            value={value || ""}
            onValueChange={(val) => handleChange(val)}
          />
        </FieldWithIndicators>
      );

    case "number":
      return wrapWithIndicators(
        <Input
          key={`number-${field.id}`}
          {...commonProps}
          {...htmlAttributes}
          type="number"
          value={value || ""}
          onValueChange={(val) => {
            // Add client-side min/max validation
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
              if (field.properties?.min !== undefined && numVal < field.properties.min) {
                return; // Don't update if below minimum
              }
              if (field.properties?.max !== undefined && numVal > field.properties.max) {
                return; // Don't update if above maximum
              }
            }
            handleChange(val);
          }}
        />
      );

    case "date":
      return wrapWithIndicators(
        <DateInput
          key={`date-${field.id}`}
          {...commonProps}
          value={value || null}
          onChange={(date) => {
            if (date) {
              // Convert to string format for form submission
              handleChange(date.toString());
            } else {
              handleChange('');
            }
          }}
        />
      );

    case "datetime":
      return (
        <DateInput
          key={`datetime-${field.id}`}
          {...commonProps}
          granularity="second"
          value={value || null}
          onChange={(date) => {
            if (date) {
              // Convert to string format for form submission
              handleChange(date.toString());
            } else {
              handleChange('');
            }
          }}
        />
      );

    case "time":
      return (
        <TimeInput
          key={`time-${field.id}`}
          {...commonProps}
          value={value || null}
          onChange={(time) => {
            if (time) {
              // Convert to string format for form submission
              handleChange(time.toString());
            } else {
              handleChange('');
            }
          }}
        />
      );

    case "textarea":
      return wrapWithIndicators(
        <>
          <Textarea
            key={`textarea-${field.id}`}
            {...commonProps}
            {...htmlAttributes}
            value={value || ""}
            onValueChange={(val) => handleChange(val)}
            rows={field.properties?.rows || 4}
            maxLength={field.properties?.maxLength}
          />
          {characterCount && (
            <div className="text-xs text-default-500 mt-1 text-right">
              {characterCount}
            </div>
          )}
        </>
      );

    case "select":
      return wrapWithIndicators(
        <Select
          {...commonProps}
          {...htmlAttributes}
          selectedKeys={value ? [value] : []}
          onSelectionChange={(keys) => {
            const selectedValue = Array.from(keys)[0];
            handleChange(selectedValue);
          }}
        >
          {field.options?.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          )) || []}
        </Select>
      );

    case "autocomplete":
      return wrapWithIndicators(
        <Autocomplete
          {...commonProps}
          {...htmlAttributes}
          selectedKey={value || ""}
          onSelectionChange={(key) => {
            handleChange(key);
          }}
          allowsCustomValue
        >
          {field.options?.map((option) => (
            <AutocompleteItem key={option.value}>{option.label}</AutocompleteItem>
          )) || []}
        </Autocomplete>
      );

    case "multiselect":
      return (
        <Select
          {...commonProps}
          selectionMode="multiple"
          selectedKeys={value || []}
          onSelectionChange={(keys) => {
            handleChange(Array.from(keys));
          }}
        >
          {field.options?.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          )) || []}
        </Select>
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
            value={value || ""}
            onValueChange={handleChange}
            size={field.properties?.size as any}
            color={field.properties?.colorVariant as any}
            isDisabled={field.advanced?.disabled || field.properties?.disabled}
            isReadOnly={field.advanced?.readOnly || field.properties?.readonly}
            orientation={radioOrientation as any}
            classNames={{
              base: heroUIClasses.base,
              label: `${heroUIClasses.label} ${radioLabelAlignmentClass}`,
              wrapper: `${heroUIClasses.inputWrapper} ${radioAlignmentClass}`,
            description: `${heroUIClasses.description} ${radioLabelAlignmentClass}`,
          }}
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
        // Multiple checkboxes
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
          <div className={`space-y-2 ${wrapperClasses} ${wrapperAlignmentClass}`}>
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
                  value={option.value}
                  isSelected={value?.includes?.(option.value) || false}
                  onValueChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      handleChange([...currentValues, option.value]);
                    } else {
                      handleChange(
                        currentValues.filter((v: any) => v !== option.value)
                      );
                    }
                  }}
                  size={field.properties?.size as any}
                  color={field.properties?.colorVariant as any}
                  radius={field.properties?.borderRadius as any}
                  isDisabled={field.advanced?.disabled || field.properties?.disabled}
                  isReadOnly={field.advanced?.readOnly || field.properties?.readonly}
                >
                  {option.label}
                </Checkbox>
              ))}
            </div>
          </div>
        );
      } else {
        // Single checkbox
        const checkboxComponentAlignment = field.properties?.componentAlignment || 'left';
        const checkboxAlignmentClass = checkboxComponentAlignment === 'center' ? 'flex justify-center' : 
                                       checkboxComponentAlignment === 'right' ? 'flex justify-end' : 'flex justify-start';
        const checkboxLabelAlignmentClass = checkboxComponentAlignment === 'center' ? 'text-center' : 
                                           checkboxComponentAlignment === 'right' ? 'text-right' : 'text-left';
        
        return (
          <div className={`${wrapperClasses} ${checkboxAlignmentClass} flex-col items-start`}>
            <label className={`text-sm font-medium ${checkboxLabelAlignmentClass} block mb-2`}>
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
              onValueChange={handleChange}              size={field.properties?.size as any}
              color={field.properties?.colorVariant as any}
              radius={field.properties?.borderRadius as any}
              isDisabled={field.advanced?.disabled || field.properties?.disabled}
              isReadOnly={field.advanced?.readOnly || field.properties?.readonly}
            >
              Check to confirm
            </Checkbox>
          </div>
        );
      }

    case "switch":
      const switchComponentAlignment = field.properties?.componentAlignment || 'left';
      const switchAlignmentClass = switchComponentAlignment === 'center' ? 'flex justify-center' : 
                                   switchComponentAlignment === 'right' ? 'flex justify-end' : 'flex justify-start';
      
      return (
        <div className={`space-y-2 ${wrapperClasses}`}>
          <div className={switchAlignmentClass}>
            <Switch
              isSelected={value || false}
              onValueChange={handleChange}
              size={field.properties?.size as any}
              color={field.properties?.colorVariant as any}
              isDisabled={field.advanced?.disabled || field.properties?.disabled}
              isReadOnly={field.advanced?.readOnly || field.properties?.readonly}
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
        </div>
      );

    case "file":
      return (
        <div className={`space-y-2 ${wrapperClasses}`}>
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-danger">*</span>}
          </label>
          {field.properties?.description && (
            <p className="text-xs text-default-500">
              {field.properties?.description}
            </p>
          )}
          <div className="border-2 border-dashed border-default-300 rounded-lg p-6 text-center hover:border-default-400 transition-colors relative">
            <Upload className="mx-auto text-default-400 mb-2" size={32} />
            <p className="text-sm text-default-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-default-500">
              {field.properties?.accept || "All file types"}
            </p>
            <input
              type="file"
              accept={field.properties?.accept}
              multiple={field.properties?.multiple}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleChange(field.properties?.multiple ? files : files[0]);
              }}
            />
          </div>
        </div>
      );

    case "rating":
      const maxRating = field.properties?.max || 5;
      const ratingComponentAlignment = field.properties?.componentAlignment || 'left';
      const ratingAlignmentClass = ratingComponentAlignment === 'center' ? 'flex justify-center' : 
                                   ratingComponentAlignment === 'right' ? 'flex justify-end' : 'flex justify-start';
      
      return (
        <div className={`space-y-2 ${wrapperClasses}`}>
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
            <div className="flex gap-1">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map(
                (rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleChange(rating)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      rating <= (value || 0)
                        ? "text-warning fill-current"
                        : "text-default-300"
                    }`}
                  />
                </button>
              )
            )}
            </div>
          </div>
        </div>
      );

    case "signature":
      return (
        <div className={`space-y-2 ${wrapperClasses}`}>
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
            onChange={handleChange}
            width={380}
            height={150}
            className="w-full"
          />
        </div>
      );

    case "section":
      return (
        <div className={wrapperClasses}>
          <Card>
            <CardBody className="py-4">
              <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
              {field.properties?.description && (
                <p className="text-default-600">{field.properties?.description}</p>
              )}
            </CardBody>
          </Card>
        </div>
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
      console.log('Header Layout Classes:', {
        marginTop: field.properties?.marginTop,
        marginBottom: field.properties?.marginBottom,
        padding: field.properties?.padding,
        alignment: field.properties?.alignment,
        headerLayoutClasses,
        defaultHeaderClasses,
        containerClasses,
        finalClasses: `header-field ${containerClasses} ${headerLayoutClasses} ${defaultHeaderClasses} ${wrapperClasses}`
      });
      
      return (
        <div className={`header-field ${containerClasses} ${headerLayoutClasses} ${defaultHeaderClasses} ${wrapperClasses}`}>
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
        <div className={`paragraph-field ${paragraphLayoutClasses} ${defaultParagraphClasses} ${wrapperClasses}`}>
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
      console.log('FormFieldRenderer Image Debug:', {
        fieldId: field.id,
        fieldLabel: field.label,
        imageUrl: field.properties?.imageUrl,
        altText: field.properties?.altText,
        maxHeight: field.properties?.maxHeight,
        properties: field.properties
      });
      
      return (
        <div className={`image-field ${imageLayoutClasses} ${defaultImageClasses} ${wrapperClasses}`}>
          {field.label && (
            <h4 className={`image-title ${!field.properties?.marginTop && !field.properties?.marginBottom ? 'mb-2' : ''}`}>{field.label}</h4>
          )}
          <div>
            {field.properties?.imageUrl ? (
              <img
                src={field.properties.imageUrl}
                alt={field.properties?.altText || field.label || "Image"}
                className="image-actual"
                style={{
                  maxHeight: field.properties?.maxHeight || '400px'
                }}
              />
            ) : (
              <div className="image-placeholder">
                <div>
                  <Upload size={32} style={{ margin: '0 auto 8px' }} />
                  <p>No image URL provided</p>
                  {field.properties?.description && (
                    <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{field.properties.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case "pagebreak":
      return (
        <div className={`my-8 ${wrapperClasses}`}>
          <Divider className="my-4" />
          <div className="text-center text-sm text-default-500">Page Break</div>
          <Divider className="my-4" />
        </div>
      );

    case "html":
      return (
        <div
          className={`prose prose-sm max-w-none ${wrapperClasses}`}
          dangerouslySetInnerHTML={{
            __html: field.properties?.description || field.label,
          }}
        />
      );

    case "range":
      return (
        <div className={`space-y-2 ${wrapperClasses}`}>
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-danger">*</span>}
          </label>
          {field.properties?.description && (
            <p className="text-xs text-default-500">
              {field.properties?.description}
            </p>
          )}
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={field.properties?.min || 0}
              max={field.properties?.max || 100}
              step={field.properties?.step || 1}
              value={value || field.properties?.min || 0}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="flex-1 h-2 bg-default-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-default-600 min-w-[3rem] text-right">
              {value || field.properties?.min || 0}
            </span>
          </div>
        </div>
      );

    case "phone":
      return (
        <Input
          {...commonProps}
          type="tel"
          value={value || ""}
          onValueChange={(val) => handleChange(val)}
        />
      );

    case "url":
      return (
        <Input
          {...commonProps}
          type="url"
          value={value || ""}
          onValueChange={(val) => handleChange(val)}
        />
      );

    case "button":
      return wrapWithIndicators(
        <Button
          key={`button-${field.id}`}
          color={field.properties?.colorVariant as any}
          size={field.properties?.size as any}
          variant={field.properties?.variant as any}
          radius={field.properties?.borderRadius as any}
          isDisabled={field.advanced?.disabled || field.properties?.disabled}
          className={heroUIClasses.base}
          onPress={() => {
            handleChange('clicked');
          }}
          {...htmlAttributes}
        >
          {field.label}
        </Button>
      );

    default:
      return (
        <div
          className={`p-4 border border-dashed border-default-300 rounded-lg text-center ${wrapperClasses}`}
        >
          <p className="text-default-500">
            Unsupported field type: {field.type}
          </p>
        </div>
      );
    }
  };

  return renderField();
}

// Export both named and default for compatibility
export const MemoizedFormFieldRenderer = React.memo(FormFieldRenderer);
export default MemoizedFormFieldRenderer;
