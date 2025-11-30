
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amiriFont } from './amiriFont'; 

const getValue = (obj: any, key: string): string => {
    const keys = key.split('.');
    let value = obj;
    for (const k of keys) {
        if (value === null || value === undefined) {
            return '';
        }
        value = value[k];
    }
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
};

export const exportToCsv = <T extends Record<string, any>>(
    filename: string,
    // FIX: Relaxed type from Record<keyof T, string> to Record<string, string> to allow for dot-notation paths.
    columns: Record<string, string>,
    data: T[]
) => {
    const columnKeys = Object.keys(columns);
    const headers = Object.values(columns);

    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            columnKeys
                .map(key => {
                    const value = getValue(row, key);
                    const escaped = ('' + value).replace(/"/g, '""');
                    return `"${escaped}"`;
                })
                .join(',')
        ),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPdf = <T extends Record<string, any>>(
    filename: string,
    // FIX: Relaxed type from Record<keyof T, string> to Record<string, string> to allow for dot-notation paths.
    columns: Record<string, string>,
    data: T[],
    language: 'ar' | 'en'
) => {
    const doc = new jsPDF();
    
    doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');

    const columnKeys = Object.keys(columns);
    const headers = [Object.values(columns)];
    
    if (language === 'ar') {
        headers[0].reverse();
    }

    const body = data.map(row =>
        columnKeys.map(key => {
            return getValue(row, key);
        })
    );

    if (language === 'ar') {
        body.forEach(row => row.reverse());
    }

    autoTable(doc, {
        head: headers,
        body: body,
        styles: {
            font: 'Amiri',
            fontStyle: 'normal',
            halign: language === 'ar' ? 'right' : 'left',
        },
        headStyles: {
            fillColor: [245, 158, 11] // amber-500
        }
    });

    doc.save(`${filename}.pdf`);
};
