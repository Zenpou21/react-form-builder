import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, ButtonGroup } from "@heroui/react";
import { GripVertical, Edit, Trash2, Copy } from "lucide-react";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { ResizeHandles } from "./ResizeHandles";
import { useFormBuilder } from "../context/FormBuilderContext";
import { buildFieldWrapperClasses } from "../utils/fieldStyles";
import type { FormField } from "../types/form";

interface SortableFormFieldProps {
  field: FormField;
  isPreview: boolean;
}

export function SortableFormField({
  field,
  isPreview,
}: SortableFormFieldProps) {
  const { state, actions } = useFormBuilder();
  const { selectedFieldId } = state;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedFieldId === field.id;

  const handleSelect = () => {
    if (!isPreview) {
      actions.selectField(field.id);
    }
  };

  const handleDuplicate = () => {
    const duplicatedField = {
      ...field,
      id: crypto.randomUUID(),
      label: `${field.label} (Copy)`,
    };
    actions.addField(duplicatedField);
  };

  const handleDelete = () => {
    actions.deleteField(field.id);
  };

  const handleEdit = () => {
    actions.selectField(field.id);
  };

  const wrapperClasses = buildFieldWrapperClasses(field, !isPreview); // isEditor = !isPreview

  if (isPreview) {
    return (
      <div className={`w-full ${wrapperClasses}`}>
        <FormFieldRenderer field={field} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group
        ${isDragging ? "opacity-50 z-50" : ""}
        ${isSelected ? "" : ""}
        ${wrapperClasses}
      `}
      onClick={!isDragging ? handleSelect : undefined}
    >
      <ResizeHandles field={field} isSelected={isSelected}>
        <div
          className={`
            border transition-all duration-200 cursor-pointer
            ${
              isSelected
                ? "border-primary shadow-lg"
                : "border-default-200 hover:border-default-300"
            }
            ${isDragging ? "shadow-2xl" : ""}
          `}
        >
          <div className="p-2">
            {/* Field Controls */}
            <div className="flex items-center justify-between mb-2 ">
              <div className="flex items-center gap-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-default-100 rounded"
                >
                  <GripVertical className="text-default-400" size={14} />
                </div>
                <span className="text-xs text-default-600 font-medium">
                  {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                </span>
              </div>

              <ButtonGroup size="sm" variant="flat">
                <Button
                  isIconOnly
                  onPress={handleEdit}
                  color={isSelected ? "primary" : "default"}
                >
                  <Edit size={16} />
                </Button>
                <Button isIconOnly onPress={handleDuplicate}>
                  <Copy size={16} />
                </Button>
                <Button isIconOnly color="danger" onPress={handleDelete}>
                  <Trash2 size={16} />
                </Button>
              </ButtonGroup>
            </div>

            {/* Field Preview */}
            <div className="pointer-events-none">
              <FormFieldRenderer field={field} />
            </div>

            {/* Field Info */}
            <div className="mt-2 pt-2 border-t border-default-200">
              <div className="flex items-center justify-between text-xs text-default-500">
                <div className="flex items-center gap-2">
                  <span>Req: {field.required ? "Yes" : "No"}</span>
                  {field.validation && field.validation.length > 0 && (
                    <span>Val: {field.validation.length}</span>
                  )}
                </div>
                <span>ID: {field.id.slice(0, 6)}...</span>
              </div>
            </div>
          </div>
        </div>
      </ResizeHandles>
    </div>
  );
}
