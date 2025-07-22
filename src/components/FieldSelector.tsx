import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  Input,
  Chip
} from "@heroui/react";
import { Search } from "lucide-react";
import { DRAG_ITEMS, FIELD_CATEGORIES } from "../data/formFields";
import type { FormFieldType } from "../types/form";
import * as LucideIcons from "lucide-react";

interface FieldSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectField: (fieldType: FormFieldType) => void;
  title?: string;
}

export function FieldSelector({ isOpen, onClose, onSelectField, title = "Select Field Type" }: FieldSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = DRAG_ITEMS.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectField = (fieldType: FormFieldType) => {
    onSelectField(fieldType);
    onClose();
    setSearchTerm("");
    setSelectedCategory(null);
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
    setSelectedCategory(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleClose}
      size="2xl"
      placement="center"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-4",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-default-500 mt-1">
                  Choose a field type to add to your form
                </p>
              </div>
            </ModalHeader>
            <ModalBody>
              {/* Search and Filter */}
              <div className="space-y-4">
                <Input
                  placeholder="Search field types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<Search size={16} />}
                  size="sm"
                  isClearable
                  onClear={() => setSearchTerm("")}
                />
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <Chip
                    variant={selectedCategory === null ? "solid" : "flat"}
                    color={selectedCategory === null ? "primary" : "default"}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Chip>
                  {FIELD_CATEGORIES.filter(cat => cat.id !== 'templates' && cat.id !== 'error').map((category) => (
                    <Chip
                      key={category.id}
                      variant={selectedCategory === category.id ? "solid" : "flat"}
                      color={selectedCategory === category.id ? "primary" : "default"}
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Field Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => {
                  const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Square;
                  return (
                    <Card
                      key={item.id}
                      isPressable
                      isHoverable
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                      onPress={() => handleSelectField(item.type)}
                    >
                      <CardBody className="p-4 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                            <IconComponent size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-default-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-default-500">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No field types found matching your search.</p>
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
