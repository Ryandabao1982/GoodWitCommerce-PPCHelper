/**
 * CSV Export Utility with UTF-8 BOM Support
 * 
 * Provides helper functions for exporting data to CSV format
 * with proper UTF-8 encoding and BOM (Byte Order Mark) for
 * compatibility with Excel and other spreadsheet applications.
 */

/**
 * Creates a CSV file with UTF-8 BOM and triggers download
 * 
 * @param csvContent - The CSV content as a string (headers and rows)
 * @param filename - The name of the file to download
 * @param includeByteOrderMark - Whether to include UTF-8 BOM (default: true)
 */
export function downloadCSV(
  csvContent: string,
  filename: string,
  includeByteOrderMark: boolean = true
): void {
  // Add UTF-8 BOM (Byte Order Mark) for proper Excel compatibility
  // The BOM ensures that Excel and other applications correctly interpret the file as UTF-8
  const bom = '\uFEFF';
  const contentWithBom = includeByteOrderMark ? bom + csvContent : csvContent;
  
  // Create blob with proper MIME type
  const blob = new Blob([contentWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a CSV field value to handle special characters
 * 
 * @param value - The value to escape
 * @returns The escaped value wrapped in quotes if needed
 */
export function escapeCSVField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quotes, or newlines, wrap it in quotes
  // and escape any existing quotes by doubling them
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of arrays to CSV format
 * 
 * @param rows - Array of rows, where each row is an array of values
 * @returns CSV-formatted string
 */
export function arrayToCSV(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows
    .map(row => row.map(escapeCSVField).join(','))
    .join('\n');
}

/**
 * Exports an array of objects to CSV
 * 
 * @param data - Array of objects to export
 * @param headers - Optional custom headers (uses object keys if not provided)
 * @param filename - The name of the file to download
 */
export function exportObjectsToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  // Use provided headers or extract from first object
  const columnHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const rows = [
    columnHeaders,
    ...data.map(obj => columnHeaders.map(header => obj[header]))
  ];
  
  const csvContent = arrayToCSV(rows);
  downloadCSV(csvContent, filename);
}
