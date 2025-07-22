import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider
} from "@heroui/react";
import { Plus, Check } from "lucide-react";
import { useFormBuilder } from "../context/FormBuilderContext";
import { createFormField } from "../data/formFields";
import { FormRowRenderer } from "./FormRowRenderer";
import { FormRenderer } from "./FormRenderer";
import { FieldSelector } from "./FieldSelector";
import { groupFieldsIntoRows } from "../utils/layoutUtils";
import { generateFormExportData } from "../utils/formExport";
import { useState } from "react";
import type { FormFieldType } from "../types/form";

// Drop Zone Component with visual indicators
function DropZone({ 
  id, 
  isOver, 
  onAddField, 
  position = "between" 
}: { 
  id: string; 
  isOver: boolean; 
  onAddField: () => void;
  position?: "top" | "between" | "bottom";
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        drop-zone-indicator relative transition-all duration-200 ease-in-out cursor-pointer
        ${position === "top" ? "h-4" : position === "bottom" ? "h-8" : "h-6"}
        ${isOver ? "active bg-primary-100 border-primary-300" : "hover:bg-default-50"}
        group
      `}
      onClick={onAddField}
    >
      {/* Visual drop indicator dots */}
      <div className={`
        absolute inset-0 flex items-center justify-center
        ${isOver ? "opacity-100" : "opacity-0 group-hover:opacity-70"}
        transition-opacity duration-200
      `}>
        <div className={`flex items-center space-x-1 ${isOver ? "drop-dots" : ""}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? "bg-primary-500" : "bg-default-400"}`} />
        </div>
      </div>
      
      {/* Tooltip text */}
      <div className={`
        drop-zone-tooltip absolute left-1/2 transform -translate-x-1/2 -translate-y-full
        px-2 py-1 text-white text-xs rounded z-50
        ${isOver ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        transition-opacity duration-200 pointer-events-none
        ${position === "bottom" ? "-top-2" : "-top-10"}
      `}>
        {isOver ? "Drop element here!" : "Drop element here or click to select"}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80" />
      </div>
    </div>
  );
}

export function FormCanvas() {
  const { state, actions } = useFormBuilder();
  const { currentForm, previewMode } = state;
  
  // Modal state for preview form submissions
  const [submissionData, setSubmissionData] = useState<Record<string, any> | null>(null);
  const {
    isOpen: isSubmissionModalOpen,
    onOpen: onSubmissionModalOpen,
    onOpenChange: onSubmissionModalOpenChange,
  } = useDisclosure();

  // Field selector modal state
  const [fieldSelectorPosition, setFieldSelectorPosition] = useState<number | null>(null);
  const {
    isOpen: isFieldSelectorOpen,
    onOpen: onFieldSelectorOpen,
    onOpenChange: onFieldSelectorOpenChange,
  } = useDisclosure();

  const { setNodeRef, isOver } = useDroppable({
    id: "form-canvas",
  });

  const handleAddField = () => {
    setFieldSelectorPosition(currentForm.fields.length); // Add at end
    onFieldSelectorOpen();
  };

  const handleAddFieldAtPosition = (position: number) => {
    setFieldSelectorPosition(position);
    onFieldSelectorOpen();
  };

  const handleFieldSelected = (fieldType: FormFieldType) => {
    const newField = createFormField(fieldType);
    if (fieldSelectorPosition !== null) {
      if (fieldSelectorPosition >= currentForm.fields.length) {
        actions.addField(newField);
      } else {
        actions.addFieldAtPosition(newField, fieldSelectorPosition);
      }
    }
    setFieldSelectorPosition(null);
  };

  const handlePreviewSubmit = (data: Record<string, any>) => {
    setSubmissionData(data);
    onSubmissionModalOpen();
  };

  if (currentForm.fields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 sm:p-4 ${
          isOver ? "bg-primary-50" : "bg-background"
        } transition-colors`}
      >
        <Card
          radius="sm"
          className="h-full border-2 p-4 sm:p-10 border-dashed border-default-300"
        >
          <CardBody className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="space-y-4">
              <Plus className="text-4xl sm:text-6xl text-default-400 mx-auto" />
              <div>
                <h3 className="text-sm sm:text-md font-semibold mb-2">
                  Start Building Your Form
                </h3>
                <p className="text-default-600 text-xs sm:text-sm max-w-xs sm:max-w-md">
                  Begin with content elements or drag fields from the sidebar
                </p>
              </div>
            </div>

            {/* Quick Start Content Options */}
            <div className="w-full max-w-md space-y-4">
              <div>
                <h4 className="text-sm font-medium text-default-700 mb-3">Quick Start with Content:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Header Option - Most Prominent */}
                  <Button
                    color="primary"
                    variant="solid"
                    size="sm"
                    radius="sm"
                    className="w-full"
                    onPress={() => {
                      const newField = createFormField("header");
                      actions.addField(newField);
                    }}
                  >
                    + Header
                  </Button>
                  
                  {/* Paragraph Option */}
                  <Button
                    color="secondary"
                    variant="flat"
                    size="sm"
                    radius="sm"
                    className="w-full"
                    onPress={() => {
                      const newField = createFormField("paragraph");
                      actions.addField(newField);
                    }}
                  >
                    + Paragraph
                  </Button>
                  
                  {/* Image Option */}
                  <Button
                    color="secondary"
                    variant="flat"
                    size="sm"
                    radius="sm"
                    className="w-full"
                    onPress={() => {
                      const newField = createFormField("image");
                      actions.addField(newField);
                    }}
                  >
                    + Image
                  </Button>
                </div>
              </div>

              {/* Template Option */}
              <div>
                <h4 className="text-sm font-medium text-default-700 mb-3">Or start with a template:</h4>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  radius="sm"
                  className="w-full"
                  onPress={() => {
                    // Add header, paragraph, and a text field as a basic template
                    const headerField = createFormField("header");
                    const paragraphField = createFormField("paragraph");
                    const textField = createFormField("text");
                    
                    actions.addField(headerField);
                    actions.addField(paragraphField);
                    actions.addField(textField);
                  }}
                >
                  Basic Form Template
                </Button>
              </div>

              <div className="text-xs text-default-500 border-t pt-4">
                Or use the field selector for more options:
              </div>
              
              <Button
                color="default"
                variant="bordered"
                size="sm"
                radius="sm"
                startContent={<Plus />}
                onPress={handleAddField}
                className="w-full"
              >
                Choose Field Type
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-2 sm:p-4 overflow-y-auto ${
        isOver ? "bg-primary-50" : "bg-background"
      } transition-colors`}
    >
      <div className={`w-full ${previewMode ? 'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto' : ''}`}>
        {/* Form Header */}
        <div className="mb-2 sm:mb-4 px-1 sm:px-2">
          {previewMode ? (
          <></>
          ) : (
            <div className="space-y-2 sm:space-y-3 mb-2 sm:mb-4 p-2 sm:p-4 bg-default-50 rounded-lg border border-default-200">
              <h3 className="text-xs sm:text-sm font-semibold text-default-700 mb-1 sm:mb-2">Form Information</h3>
              <Input
                label="Form Title"
                placeholder="Enter form title..."
                value={currentForm.title}
                onChange={(e) => actions.updateFormMeta({ title: e.target.value })}
                size="sm"
                className="w-full"
              />
              <Textarea
                label="Form Description (Optional)"
                placeholder="Enter a brief description of your form..."
                value={currentForm.description || ""}
                onChange={(e) => actions.updateFormMeta({ description: e.target.value })}
                size="sm"
                rows={2}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Form Fields */}
        {previewMode ? (
          // In preview mode, use the same FormRenderer that will be used with exported JSON
          <FormRenderer 
            formConfig={generateFormExportData(currentForm)}
            onSubmit={handlePreviewSubmit}
          />
        ) : (
          <>
            <SortableContext
              items={currentForm.fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {/* Top drop zone */}
                <DropZone 
                  id="drop-zone-top" 
                  isOver={isOver} 
                  onAddField={() => handleAddFieldAtPosition(0)}
                  position="top"
                />
                
                {groupFieldsIntoRows(currentForm.fields).map((row, rowIndex) => {
                  // Calculate the field index where this row starts
                  const fieldsBeforeThisRow = currentForm.fields.slice(0, 
                    currentForm.fields.findIndex(field => field.id === row.fields[0].id)
                  ).length;
                  
                  return (
                    <div key={row.id}>
                      <FormRowRenderer row={row} isPreview={false} />
                      {/* Drop zone between rows */}
                      {rowIndex < groupFieldsIntoRows(currentForm.fields).length - 1 && (
                        <DropZone 
                          id={`drop-zone-after-row-${rowIndex}-field-${fieldsBeforeThisRow + row.fields.length - 1}`} 
                          isOver={isOver} 
                          onAddField={() => handleAddFieldAtPosition(fieldsBeforeThisRow + row.fields.length)}
                          position="between"
                        />
                      )}
                    </div>
                  );
                })}
                
                {/* Bottom drop zone */}
                <DropZone 
                  id="drop-zone-bottom" 
                  isOver={isOver} 
                  onAddField={handleAddField}
                  position="bottom"
                />
              </div>
            </SortableContext>

            {/* Submit Button (edit mode) */}
            <div className="mt-2 flex justify-end sm:mt-4 pt-2 sm:pt-4 border-t border-divider px-1 sm:px-2">
              <Button
                radius="sm"
                color="primary"
                type="submit"
                disabled={true}
                className="sm:size-lg"
              >
                {currentForm.settings.submitButtonText}
              </Button>
            </div>

            {/* Add Field Button */}
            <div className="mt-2 sm:mt-4 px-1 sm:px-2">
              <Button
                radius="sm"
                variant="bordered"
                startContent={<Plus />}
                onPress={handleAddField}
                className="w-full"
                size="sm"
              >
                <span className="hidden sm:inline">Add Field</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Preview Submission Result Modal */}
      <Modal
        isOpen={isSubmissionModalOpen}
        onOpenChange={onSubmissionModalOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Form Preview Submission</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      Form submitted successfully in preview mode!
                    </span>
                  </div>
                  <Divider />
                  <div>
                    <h4 className="font-semibold mb-2">Submitted Data:</h4>
                    <div className="bg-success-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(submissionData, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="text-sm text-default-600">
                    <strong>Preview Mode:</strong> This shows how your form will behave when submitted. 
                    In a real application, this data would be sent to your server or API endpoint.
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="flat"
                  onPress={async () => {
                    if (submissionData) {
                      await navigator.clipboard.writeText(
                        JSON.stringify(submissionData, null, 2)
                      );
                    }
                  }}
                >
                  Copy Data
                </Button>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Field Selector Modal */}
      <FieldSelector
        isOpen={isFieldSelectorOpen}
        onClose={() => {
          onFieldSelectorOpenChange();
          setFieldSelectorPosition(null);
        }}
        onSelectField={handleFieldSelected}
        title={`Add Field ${fieldSelectorPosition !== null ? `at Position ${fieldSelectorPosition + 1}` : ''}`}
      />
    </div>
  );
}
