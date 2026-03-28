import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import mammoth from 'mammoth';

// Provide the absolute Chrome URL mapped to our Webpack output file
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');

export async function parseDocument(file) {
  const fileType = file.name.split('.').pop().toLowerCase();
  const buffer = await file.arrayBuffer();

  if (fileType === 'pdf') {
    return await extractPdfText(buffer);
  } else if (fileType === 'docx') {
    return await extractDocxText(buffer);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
  }
}

async function extractPdfText(arrayBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n';
    }
    return fullText;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to parse PDF document.");
  }
}

async function extractDocxText(arrayBuffer) {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (error) {
    console.error("DOCX Parsing Error:", error);
    throw new Error("Failed to parse DOCX document.");
  }
}
