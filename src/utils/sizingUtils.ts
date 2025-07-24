import type { FormField } from '../types/form';

/**
 * Generates CSS styles and classes for dynamic sizing
 */
export function generateSizingStyles(field: FormField) {
  const properties = field.properties;
  const layout = field.layout;
  
  // CSS style object for inline styles
  const styles: React.CSSProperties = {};
  
  // Tailwind classes for grid and responsive behavior
  const classes: string[] = [];
  
  // CSS dimensions (direct styles)
  if (properties?.width) {
    styles.width = properties.width;
  }
  
  if (properties?.height) {
    styles.height = properties.height;
  }
  
  if (properties?.minWidth) {
    styles.minWidth = properties.minWidth;
  }
  
  if (properties?.maxWidth) {
    styles.maxWidth = properties.maxWidth;
  }
  
  if (properties?.minHeight) {
    styles.minHeight = properties.minHeight;
  }
  
  if (properties?.maxHeight) {
    styles.maxHeight = properties.maxHeight;
  }
  
  // Grid column span
  const columnSpan = properties?.columnSpan || layout?.columnSpan || 12;
  classes.push(`col-span-${columnSpan}`);
  
  // Grid row span (if supported)
  const rowSpan = properties?.rowSpan || layout?.rowSpan;
  if (rowSpan && rowSpan > 1) {
    classes.push(`row-span-${rowSpan}`);
  }
  
  // Start new row behavior
  const startNewRow = properties?.startNewRow || layout?.startNewRow;
  if (startNewRow) {
    classes.push('col-start-1'); // Force start at first column
  }
  
  return {
    styles,
    classes: classes.join(' '),
    shouldStartNewRow: startNewRow,
    columnSpan,
    rowSpan
  };
}

/**
 * Generates container styles for wrapper divs
 */
export function generateContainerStyles(field: FormField) {
  const sizing = generateSizingStyles(field);
  
  return {
    style: sizing.styles,
    className: sizing.classes
  };
}

/**
 * Helper to check if field needs special layout handling
 */
export function needsLayoutHandling(field: FormField): boolean {
  const properties = field.properties;
  const layout = field.layout;
  
  return !!(
    properties?.width ||
    properties?.height ||
    properties?.minWidth ||
    properties?.maxWidth ||
    properties?.minHeight ||
    properties?.maxHeight ||
    properties?.startNewRow ||
    layout?.startNewRow ||
    (properties?.columnSpan && properties.columnSpan !== 12) ||
    (properties?.rowSpan && properties.rowSpan > 1)
  );
}
