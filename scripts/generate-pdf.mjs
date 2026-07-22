/**
 * Generate PDF from USER_GUIDE.html using puppeteer-core + existing Chrome
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');
const htmlPath = path.join(docsDir, 'USER_GUIDE.html');
const pdfPath = path.join(docsDir, '93_Cross_Fitness_User_Guide.pdf');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

console.log('Launching Chrome...');
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});

const page = await browser.newPage();

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });

console.log('Generating PDF...');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:8pt;color:#999;text-align:center;width:100%;font-family:Inter,sans-serif;">93 Cross Fitness Gym & Spa — User Guide</div>',
  footerTemplate: '<div style="font-size:8pt;color:#999;text-align:center;width:100%;font-family:Inter,sans-serif;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
});

await browser.close();
console.log('✅ Generated PDF:', pdfPath);
