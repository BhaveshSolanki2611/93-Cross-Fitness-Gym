/**
 * Generate DOCX from USER_GUIDE.md using the docx library
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageBreak, ExternalHyperlink,
  Footer, Header, PageNumber
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');

// Read markdown
const md = fs.readFileSync(path.join(docsDir, 'USER_GUIDE.md'), 'utf8');

// Simple markdown parser
function parseMarkdown(text) {
  const lines = text.split('\n');
  const children = [];
  let i = 0;
  let inTable = false;
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];

  const parseInline = (line) => {
    const runs = [];
    // Simple bold/link parsing
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: 'Calibri', size: 22 }));
      } else {
        runs.push(new TextRun({ text: part, font: 'Calibri', size: 22 }));
      }
    }
    return runs;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        children.push(new Paragraph({
          children: [new TextRun({ text: codeLines.join('\n'), font: 'Consolas', size: 18 })],
          spacing: { before: 100, after: 100 },
          shading: { type: ShadingType.SOLID, color: 'F0F0F0' },
        }));
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Table rows
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator rows
      if (line.match(/^\|[\s-:|]+\|$/)) {
        i++;
        continue;
      }
      const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
      tableRows.push(cells);
      i++;
      continue;
    } else if (inTable) {
      // End of table
      if (tableRows.length > 0) {
        const maxCols = Math.max(...tableRows.map(r => r.length));
        const rows = tableRows.map((cells, rowIdx) => {
          const tableCells = [];
          for (let c = 0; c < maxCols; c++) {
            const cellText = cells[c] || '';
            tableCells.push(new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: cellText.replace(/\*\*/g, ''),
                  bold: rowIdx === 0,
                  font: 'Calibri',
                  size: 20,
                  color: rowIdx === 0 ? 'FFFFFF' : '1A1A1A'
                })],
                spacing: { before: 40, after: 40 },
              })],
              shading: rowIdx === 0
                ? { type: ShadingType.SOLID, color: '1A1A1A' }
                : rowIdx % 2 === 0
                  ? { type: ShadingType.SOLID, color: 'F7F7F7' }
                  : undefined,
              width: { size: Math.floor(9000 / maxCols), type: WidthType.DXA },
            }));
          }
          return new TableRow({ children: tableCells });
        });
        children.push(new Table({
          rows,
          width: { size: 9000, type: WidthType.DXA },
        }));
      }
      tableRows = [];
      inTable = false;
    }

    // Headings
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^# /, '').replace(/\*\*/g, ''), bold: true, font: 'Calibri', size: 48, color: '111111' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C8FF00' } },
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^## /, '').replace(/\*\*/g, ''), bold: true, font: 'Calibri', size: 36, color: '222222' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E0E0E0' } },
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^### /, '').replace(/\*\*/g, ''), bold: true, font: 'Calibri', size: 28, color: '333333' })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 280, after: 120 },
      }));
    } else if (line.startsWith('#### ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^#### /, '').replace(/\*\*/g, ''), bold: true, font: 'Calibri', size: 24, color: '444444' })],
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 200, after: 80 },
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.replace(/^[-*] /, '');
      children.push(new Paragraph({
        children: parseInline(content),
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
      }));
    } else if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\. /, '');
      children.push(new Paragraph({
        children: parseInline(content),
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 40, after: 40 },
      }));
    } else if (line.startsWith('---')) {
      children.push(new Paragraph({
        children: [],
        spacing: { before: 200, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E0E0E0' } },
      }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ children: [], spacing: { before: 60, after: 60 } }));
    } else {
      children.push(new Paragraph({
        children: parseInline(line),
        spacing: { before: 60, after: 60 },
      }));
    }

    i++;
  }

  // Flush any remaining table
  if (inTable && tableRows.length > 0) {
    const maxCols = Math.max(...tableRows.map(r => r.length));
    const rows = tableRows.map((cells, rowIdx) => {
      const tableCells = [];
      for (let c = 0; c < maxCols; c++) {
        const cellText = cells[c] || '';
        tableCells.push(new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: cellText.replace(/\*\*/g, ''),
              bold: rowIdx === 0,
              font: 'Calibri',
              size: 20,
            })],
          })],
          width: { size: Math.floor(9000 / maxCols), type: WidthType.DXA },
        }));
      }
      return new TableRow({ children: tableCells });
    });
    children.push(new Table({ rows, width: { size: 9000, type: WidthType.DXA } }));
  }

  return children;
}

const docChildren = parseMarkdown(md);

const doc = new Document({
  numbering: {
    config: [{
      reference: 'default-numbering',
      levels: [{
        level: 0,
        format: 'decimal',
        text: '%1.',
        alignment: AlignmentType.START,
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: '93 Cross Fitness Gym & Spa — User Guide', font: 'Calibri', size: 16, color: '999999', italics: true })],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'Page ', font: 'Calibri', size: 16, color: '999999' }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 16, color: '999999' }),
          ],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children: docChildren,
  }],
});

const buffer = await Packer.toBuffer(doc);
const outPath = path.join(docsDir, '93_Cross_Fitness_User_Guide.docx');
fs.writeFileSync(outPath, buffer);
console.log('✅ Generated DOCX:', outPath);
