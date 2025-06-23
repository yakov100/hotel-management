import * as XLSX from 'xlsx';

// Helper function to format dates
function formatDate(date) {
  if (!date) return '';
  try {
    // Handle Firebase Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      const d = date.toDate();
      return `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Handle regular Date objects
    if (date instanceof Date) {
      return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Handle ISO strings
    if (typeof date === 'string') {
      const d = new Date(date);
      return `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return '';
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
}

// Helper function to format numbers
function formatNumber(num) {
  if (num === null || num === undefined) return '';
  if (typeof num === 'number') {
    return num.toLocaleString('he-IL');
  }
  const parsed = parseFloat(num);
  if (!isNaN(parsed)) {
    return parsed.toLocaleString('he-IL');
  }
  return '';
}

// Helper function to clean text
function cleanText(text) {
  if (text === null || text === undefined) return '';
  return String(text).trim();
}

export function exportToCSV(data, filename = 'export.csv') {
  try {
    if (!data || !data.length) {
      console.warn('No data to export');
      return;
    }

    // Add BOM for UTF-8 encoding support in Excel
    const BOM = '\uFEFF';
    
    // Get headers from the first object
    const keys = Object.keys(data[0]);
    
    // Create CSV rows with proper escaping and formatting
    const csvRows = [
      // Headers row
      keys.map(key => `"${key}"`).join(','),
      // Data rows
      ...data.map(row => 
        keys.map(key => {
          const value = row[key];
          if (value === null || value === undefined) {
            return '""';
          }
          // Escape quotes and format the value
          const formattedValue = String(value)
            .replace(/"/g, '""') // Escape quotes
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .trim();
          return `"${formattedValue}"`;
        }).join(',')
      )
    ];

    // Join rows with proper line endings
    const csvString = BOM + csvRows.join('\r\n');

    // Create and download the file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error(`Failed to export to CSV: ${error.message}`);
  }
}

export function exportToExcel(data, filename = 'export.xlsx') {
  try {
    if (!data || !data.length) {
      console.warn('No data to export');
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet, handling potential null/undefined values
    const wsData = data.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        // Handle null/undefined/special types
        let value = row[key];
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          // Handle special object types (like Dates)
          if (value instanceof Date || (value && value.toDate)) {
            value = formatDate(value);
          } else {
            value = JSON.stringify(value);
          }
        }
        newRow[key] = value;
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);

    // Set column widths
    const colWidths = [];
    Object.keys(data[0] || {}).forEach(() => {
      colWidths.push({ wch: 15 }); // Set default width to 15 characters
    });
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write file with proper encoding
    XLSX.writeFile(wb, filename, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary',
      cellStyles: true,
      compression: true
    });

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(`Failed to export to Excel: ${error.message}`);
  }
}

export function mapBookingsForExport(bookings) {
  return bookings.map(b => ({
    מזהה: cleanText(b.id),
    'שם אורח': cleanText(b.guestName),
    טלפון: cleanText(b.guestPhone),
    'דואר אלקטרוני': cleanText(b.guestEmail),
    'תאריך כניסה': formatDate(b.checkIn),
    'תאריך יציאה': formatDate(b.checkOut),
    סטטוס: cleanText(b.status),
    הערות: cleanText(b.notes),
    'מחיר כולל': formatNumber(b.totalPrice)
  }));
}

export function mapGuestsForExport(guests) {
  return guests.map(g => ({
    מזהה: cleanText(g.id),
    'שם אורח': cleanText(g.guestName || g.name),
    טלפון: cleanText(g.phone),
    'דואר אלקטרוני': cleanText(g.email),
    הערות: cleanText(g.notes),
    'תאריך הוספה': formatDate(g.createdAt)
  }));
}

export function mapTasksForExport(tasks) {
  return tasks.map(t => ({
    מזהה: cleanText(t.id),
    כותרת: cleanText(t.title),
    תיאור: cleanText(t.description),
    סטטוס: cleanText(t.status),
    עדיפות: cleanText(t.priority),
    'תאריך יעד': formatDate(t.dueDate),
    'הוקצה ל': cleanText(t.assignedTo),
    הערות: cleanText(t.notes)
  }));
}

export function mapFinancesForExport(finances) {
  return finances.map(f => ({
    מזהה: cleanText(f.id),
    סוג: cleanText(f.type),
    סכום: formatNumber(f.amount),
    קטגוריה: cleanText(f.category),
    תיאור: cleanText(f.description),
    תאריך: formatDate(f.date),
    'אמצעי תשלום': cleanText(f.paymentMethod),
    הערות: cleanText(f.notes)
  }));
}

export function mapInventoryForExport(inventory) {
  return inventory.map(i => ({
    מזהה: cleanText(i.id),
    'שם פריט': cleanText(i.name),
    כמות: formatNumber(i.quantity),
    'כמות מינימלית': formatNumber(i.minQuantity),
    מיקום: cleanText(i.location),
    קטגוריה: cleanText(i.category),
    הערות: cleanText(i.notes),
    'תאריך עדכון': formatDate(i.updatedAt)
  }));
}

export function mapMaintenanceForExport(maintenance) {
  return maintenance.map(m => ({
    מזהה: cleanText(m.id),
    כותרת: cleanText(m.title),
    תיאור: cleanText(m.description),
    סטטוס: cleanText(m.status),
    עדיפות: cleanText(m.priority),
    'תאריך דיווח': formatDate(m.reportedAt),
    'תאריך טיפול': formatDate(m.resolvedAt),
    'הוקצה ל': cleanText(m.assignedTo),
    מיקום: cleanText(m.location),
    הערות: cleanText(m.notes)
  }));
} 