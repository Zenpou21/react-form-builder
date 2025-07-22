import { useState } from "react";
import { Accordion, AccordionItem, Button, Input, Chip } from "@heroui/react";
import { useDraggable } from "@dnd-kit/core";
import {
  DRAG_ITEMS,
  FIELD_CATEGORIES,
  createFormField,
} from "../data/formFields";
import { useFormBuilder } from "../context/FormBuilderContext";
import type { FormFieldType } from "../types/form";
import * as LucideIcons from "lucide-react";

interface DraggableFieldProps {
  id: string;
  type: FormFieldType;
  label: string;
  icon: string;
  category: string;
}

function DraggableField({
  id,
  type,
  label,
  icon,
  category,
}: DraggableFieldProps) {
  const { addField } = useFormBuilder().actions;
  const isComingSoon = category === "structure"; // Only structure category is coming soon

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: isComingSoon, // Disable dragging for coming soon items
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Plus;

  const handleClick = () => {
    if (isComingSoon) {
      return; // Prevent adding coming soon items
    }
    const newField = createFormField(type);
    addField(newField);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isComingSoon ? listeners : {})}
      {...(!isComingSoon ? attributes : {})}
      className={`${
        !isComingSoon
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-not-allowed"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <Button
        size="sm"
        radius="sm"
        variant="flat"
        className={`mb-1 w-full transition-colors relative ${
          isComingSoon
            ? "bg-white"
            : "bg-white hover:bg-default-100 cursor-pointer"
        }`}
        onPress={handleClick}
        isDisabled={isComingSoon}
      >
        <div className="flex absolute left-1 sm:left-3 items-center justify-start text-start gap-1 sm:gap-1.5">
          <IconComponent size={14} className="sm:w-4 sm:h-4" />
          <span className="text-xs font-body inline">{label}</span>
        </div>
        {isComingSoon && (
          <div className="absolute bg-white right-1 top-1/2 transform -translate-y-1/2">
            <Chip
              size="sm"
              color="secondary"
              variant="flat"
              className="text-xs px-1 py-0 min-h-unit-5 h-5"
            >
              Soon
            </Chip>
          </div>
        )}
      </Button>
    </div>
  );
}

export function FieldSidebar() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = DRAG_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = FIELD_CATEGORIES.map((category) => ({
    ...category,
    items: filteredItems.filter((item) => item.category === category.id),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="w-full bg-background border-r border-divider h-full overflow-y-auto scrollbar-hide">
      <div className="p-1 sm:p-2 border-b border-divider">
        <h2 className="text-xs sm:text-sm font-semibold mb-2 hidden sm:block">
          Form Elements
        </h2>
        <h2 className="text-xs font-semibold mb-2 sm:hidden">Elements</h2>
        <Input
          radius="sm"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          className="w-full text-xs"
        />
      </div>

      <div className="p-1 sm:p-2">
        <Accordion
          isCompact
          variant="light"
          selectionMode="multiple"
          defaultExpandedKeys={["basic", "choices"]}
        >
          {groupedItems.map((category) => {
            return (
              <AccordionItem
                key={category.id}
                aria-label={category.label}
                title={
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm inline">
                      {category.label}
                    </span>
                    <span className="text-xs sm:hidden">
                      {category.label.charAt(0)}
                    </span>
                    <span className="text-xs text-default-500 inline">
                      ({category.items.length})
                    </span>
                  </div>
                }
              >
                <div className="space-y-1 sm:space-y-2 pb-2">
                  {category.items.map((item) => (
                    <DraggableField
                      key={item.id}
                      id={item.id}
                      type={item.type}
                      label={item.label}
                      icon={item.icon}
                      category={item.category}
                    />
                  ))}
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
