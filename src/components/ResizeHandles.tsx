import React, { useState, useRef, useEffect } from 'react';
import { useFormBuilder } from '../context/FormBuilderContext';
import type { FormField } from '../types/form';

interface ResizeHandlesProps {
  field: FormField;
  isSelected: boolean;
  children: React.ReactNode;
}

export function ResizeHandles({ field, isSelected, children }: ResizeHandlesProps) {
  const { actions } = useFormBuilder();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const updateProperties = (updates: any) => {
    actions.updateFieldProperties(field.id, updates);
  };

  const updateLayout = (updates: any) => {
    actions.updateField(field.id, {
      layout: {
        ...field.layout,
        ...updates,
      },
    });
  };

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: rect.width, height: rect.height });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    
    if (resizeDirection.includes('right')) {
      newWidth = Math.max(100, startSize.width + deltaX);
    }
    if (resizeDirection.includes('left')) {
      newWidth = Math.max(100, startSize.width - deltaX);
    }
    if (resizeDirection.includes('bottom')) {
      newHeight = Math.max(50, startSize.height + deltaY);
    }
    if (resizeDirection.includes('top')) {
      newHeight = Math.max(50, startSize.height - deltaY);
    }
    
    // Update field properties with new dimensions
    const updates: any = {};
    
    if (resizeDirection.includes('right') || resizeDirection.includes('left')) {
      updates.width = `${newWidth}px`;
      // Also update column span based on width
      const columnSpan = Math.min(12, Math.max(1, Math.round((newWidth / containerRef.current.parentElement!.clientWidth) * 12)));
      updates.columnSpan = columnSpan;
      updateLayout({ columnSpan, gridClass: `col-span-${columnSpan}` });
    }
    
    if (resizeDirection.includes('bottom') || resizeDirection.includes('top')) {
      updates.height = `${newHeight}px`;
    }
    
    updateProperties(updates);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeDirection('');
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleBreakRow = () => {
    const newValue = !field.properties?.startNewRow;
    updateProperties({ startNewRow: newValue });
    updateLayout({ startNewRow: newValue });
  };

  const getContainerStyle = () => {
    const style: React.CSSProperties = {};
    
    if (field.properties?.width) {
      style.width = field.properties.width;
    }
    if (field.properties?.height) {
      style.height = field.properties.height;
    }
    if (field.properties?.minWidth) {
      style.minWidth = field.properties.minWidth;
    }
    if (field.properties?.maxWidth) {
      style.maxWidth = field.properties.maxWidth;
    }
    if (field.properties?.minHeight) {
      style.minHeight = field.properties.minHeight;
    }
    if (field.properties?.maxHeight) {
      style.maxHeight = field.properties.maxHeight;
    }
    
    return style;
  };

  const getGridClasses = () => {
    const columnSpan = field.properties?.columnSpan || field.layout?.columnSpan || 12;
    const rowSpan = field.properties?.rowSpan || field.layout?.rowSpan || 1;
    
    let classes = `col-span-${columnSpan}`;
    
    if (rowSpan > 1) {
      classes += ` row-span-${rowSpan}`;
    }
    
    if (field.properties?.startNewRow || field.layout?.startNewRow) {
      classes += ' col-start-1';
    }
    
    return classes;
  };

  return (
    <div
      ref={containerRef}
      className={`relative group ${getGridClasses()}`}
      style={getContainerStyle()}
    >
      {children}
      
      {/* Resize handles - show on hover or when selected */}
      <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto">
        {/* Corner handles */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-nw-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
          title="Resize top-left corner"
        />
        <div
          className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-ne-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
          title="Resize top-right corner"
        />
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-sw-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
          title="Resize bottom-left corner"
        />
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-se-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
          title="Resize bottom-right corner"
        />
        
        {/* Edge handles */}
        <div
          className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded cursor-n-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'top')}
          title="Resize height (top)"
        />
        <div
          className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded cursor-s-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
          title="Resize height (bottom)"
        />
        <div
          className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 border-2 border-white rounded cursor-w-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'left')}
          title="Resize width (left)"
        />
        <div
          className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 border-2 border-white rounded cursor-e-resize shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:bg-blue-600 transition-all duration-200 pointer-events-auto z-50"
          onMouseDown={(e) => handleMouseDown(e, 'right')}
          title="Resize width (right)"
        />
        
        {/* Row break handle */}
        <div
          className={`absolute -top-8 left-2 px-2 py-1 text-xs font-medium rounded cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 pointer-events-auto z-50 ${
            field.properties?.startNewRow || field.layout?.startNewRow
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
          onClick={handleBreakRow}
          title={
            field.properties?.startNewRow || field.layout?.startNewRow
              ? 'Click to remove row break'
              : 'Click to start new row'
          }
        >
          {field.properties?.startNewRow || field.layout?.startNewRow ? '⤴ Remove Break' : '⤷ New Row'}
        </div>
      </div>
      
      {/* Visual feedback while resizing */}
      {isResizing && (
        <div className="absolute inset-0 border-2 border-blue-500 border-dashed bg-blue-500/10 pointer-events-none z-40 rounded" />
      )}
      
      {/* Hover border to show field boundaries */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 transition-colors duration-200 rounded pointer-events-none z-30" />
    </div>
  );
}
