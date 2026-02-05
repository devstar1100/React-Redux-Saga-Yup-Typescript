export const getRowId = (rowIndex: number): string => `table_row-${rowIndex}`;

export const getColumnId = (rowIndex: number, columnIndex: number): string => `table_column-${rowIndex}-${columnIndex}`;

export const getWidgetId = (elementId: number): string => `widget-${elementId}`;
