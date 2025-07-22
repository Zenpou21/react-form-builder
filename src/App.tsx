import { useState } from "react";
import {
  HeroUIProvider,
  Button,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { 
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import {
  FormBuilderProvider,
  useFormBuilder,
} from "./context/FormBuilderContext";
import { FormBuilderToolbar } from "./components/FormBuilderToolbar";
import { FieldSidebar } from "./components/FieldSidebar";
import { FormCanvas } from "./components/FormCanvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { JsonFormRenderer } from "./examples/JsonFormRenderer";
import WhatsNewPage from "./pages/WhatsNewPage";
import { createFormField } from "./data/formFields";
import type { FormFieldType } from "./types/form";
import { Package, Settings, Sparkles } from "lucide-react";
import "./App.css";
import "./styles.css";

type AppMode = "builder" | "renderer" | "announcement";

function AppModeSelector({
  mode,
  setMode,
}: {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}) {
  return (
    <div className="p-4 border-b border-divider bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Form Builder Suite
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden sm:block">
          <ButtonGroup className="" radius="sm">
            <Button
              variant={mode === "builder" ? "solid" : "flat"}
              color={mode === "builder" ? "secondary" : "default"}
              onPress={() => setMode("builder")}
            >
              Form Builder
            </Button>
            <Button
              variant={mode === "renderer" ? "solid" : "flat"}
              color={mode === "renderer" ? "secondary" : "default"}
              onPress={() => setMode("renderer")}
            >
              JSON Renderer
            </Button>
            <Button
              variant={mode === "announcement" ? "solid" : "flat"}
              color={mode === "announcement" ? "secondary" : "default"}
              onPress={() => setMode("announcement")}
              startContent={
                <Sparkles className="w-4 h-4 sparkle-animation text-warning-500" />
              }
            >
              What's New{" "}
              <Chip
                size="sm"
                color="success"
                variant="solid"
                className="ml-2 text-white"
              >
                v1.1
              </Chip>
            </Button>
          </ButtonGroup>
        </div>

        {/* Mobile Navigation */}
        <div className="block sm:hidden">
          <div className="flex flex-col gap-2">
            {/* Row 1: Form Builder and JSON Renderer */}
            <div className="flex gap-2">
              <Button
                variant={mode === "builder" ? "solid" : "flat"}
                color={mode === "builder" ? "secondary" : "default"}
                onPress={() => setMode("builder")}
                className="flex-1"
                size="sm"
              >
                Builder
              </Button>
              <Button
                variant={mode === "renderer" ? "solid" : "flat"}
                color={mode === "renderer" ? "secondary" : "default"}
                onPress={() => setMode("renderer")}
                className="flex-1"
                size="sm"
              >
                Renderer
              </Button>
            </div>

            {/* Row 2: What's New button (full width) */}
            <Button
              variant={mode === "announcement" ? "solid" : "flat"}
              color={mode === "announcement" ? "secondary" : "default"}
              onPress={() => setMode("announcement")}
              startContent={
                <Sparkles className="w-3 h-3 sparkle-animation text-warning-500" />
              }
              className="w-full"
              size="sm"
            >
              What's New{" "}
              <Chip
                size="sm"
                color="success"
                variant="solid"
                className="ml-1 text-white text-xs"
              >
                v1.1
              </Chip>
            </Button>
          </div>
        </div>

        {/* Mode descriptions */}
        <div className="mt-3 text-sm text-default-500">
          {mode === "builder" &&
            "Create and design forms with drag-and-drop interface"}
          {mode === "renderer" &&
            "Import JSON configurations and render live forms"}
          {mode === "announcement" &&
            "Discover new features and improvements in the latest version"}
        </div>
      </div>
    </div>
  );
}

function FormBuilderContent() {
  const { state, actions } = useFormBuilder();
  const { currentForm, previewMode } = state;

  // Configure drag sensors for better touch and mouse support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch
        tolerance: 8,
      },
    })
  );

  // Modal controls for mobile panels
  const {
    isOpen: isElementsOpen,
    onOpen: onElementsOpen,
    onOpenChange: onElementsOpenChange,
  } = useDisclosure();

  const {
    isOpen: isPropertiesOpen,
    onOpen: onPropertiesOpen,
    onOpenChange: onPropertiesOpenChange,
  } = useDisclosure();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { activeId: active.id, overId: over?.id });

    if (!over) {
      console.log('No drop target found');
      return;
    }

    // Handle dropping from sidebar to canvas or drop zones
    if (
      (over.id === "form-canvas" || 
       over.id === "drop-zone-top" || 
       over.id === "drop-zone-bottom" || 
       String(over.id).startsWith("drop-zone-")) &&
      typeof active.id === "string" &&
      !active.id.includes("-")
    ) {
      console.log('Dropping field to canvas/drop zone:', active.id);
      const fieldType = active.id as FormFieldType;
      const newField = createFormField(fieldType);
      
      // Handle positioning based on drop zone
      if (over.id === "drop-zone-top") {
        // Add to beginning
        actions.addFieldAtPosition(newField, 0);
      } else if (over.id === "drop-zone-bottom") {
        // Add to end (default behavior)
        actions.addField(newField);
      } else if (String(over.id).startsWith("drop-zone-after-row-")) {
        // Extract the field position from the drop zone ID
        // Format: "drop-zone-after-row-{rowIndex}-field-{fieldIndex}"
        const match = String(over.id).match(/drop-zone-after-row-\d+-field-(\d+)/);
        if (match) {
          const lastFieldIndex = parseInt(match[1]);
          actions.addFieldAtPosition(newField, lastFieldIndex + 1);
        } else {
          // Fallback to end
          actions.addField(newField);
        }
      } else {
        // Default to end
        actions.addField(newField);
      }
      return;
    }

    // Handle reordering within canvas
    if (active.id !== over.id) {
      console.log('Reordering fields:', { from: active.id, to: over.id });
      const oldIndex = currentForm.fields.findIndex(
        (field) => field.id === active.id
      );
      const newIndex = currentForm.fields.findIndex(
        (field) => field.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        actions.reorderFields(oldIndex, newIndex);
      }
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  return (
    <>
      <div className="h-[calc(100vh-120px)] font-sans flex flex-col bg-background">
        <FormBuilderToolbar />
        <div className="flex flex-1 overflow-hidden">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd} 
            onDragOver={handleDragOver}
          >
            {/* Desktop Sidebar - Hidden on mobile */}
            {!previewMode && (
              <div className="hidden md:block md:w-1/4">
                <FieldSidebar />
              </div>
            )}

            {/* Main Canvas - Full width on mobile, responsive on desktop */}
            <div
              className={`
              flex-1 overflow-auto scrollbar-hide
              ${previewMode ? "w-full" : "w-full md:w-2/4"}
            `}
            >
              <FormCanvas />
            </div>

            {/* Desktop Properties Panel - Hidden on mobile */}
            {!previewMode && (
              <div className="hidden md:block md:w-1/4">
                <PropertiesPanel />
              </div>
            )}
          </DndContext>
        </div>

        {/* Mobile Bottom Navigation */}
        {!previewMode && (
          <div className="md:hidden border-t border-divider bg-background p-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                className="flex-1"
                startContent={<Package size={16} />}
                onPress={onElementsOpen}
              >
                Elements
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="flex-1"
                startContent={<Settings size={16} />}
                onPress={onPropertiesOpen}
              >
                Properties
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Elements Modal for Mobile */}
      <Modal
        isOpen={isElementsOpen}
        onOpenChange={onElementsOpenChange}
        size="full"
        placement="bottom"
        classNames={{
          base: "md:hidden",
          backdrop: "md:hidden",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Form Elements</h3>
                <p className="text-sm text-default-500">
                  Drag or tap to add elements to your form
                </p>
              </ModalHeader>
              <ModalBody>
                <FieldSidebar />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Properties Modal for Mobile */}
      <Modal
        isOpen={isPropertiesOpen}
        onOpenChange={onPropertiesOpenChange}
        size="full"
        placement="bottom"
        classNames={{
          base: "md:hidden",
          backdrop: "md:hidden",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Field Properties</h3>
                <p className="text-sm text-default-500">
                  {state.selectedFieldId
                    ? `Editing: ${
                        currentForm.fields.find(
                          (f) => f.id === state.selectedFieldId
                        )?.label || "Untitled Field"
                      }`
                    : "Select a field to edit properties"}
                </p>
              </ModalHeader>
              <ModalBody>
                <PropertiesPanel />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>("builder");

  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-background">
        <AppModeSelector mode={mode} setMode={setMode} />

        {mode === "builder" && (
          <FormBuilderProvider>
            <FormBuilderContent />
          </FormBuilderProvider>
        )}
        {mode === "renderer" && <JsonFormRenderer />}
        {mode === "announcement" && <WhatsNewPage />}
      </div>
    </HeroUIProvider>
  );
}

export default App;
