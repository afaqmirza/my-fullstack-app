export const TOOL_INSTRUCTIONS = {
  'pdf-to-word': {
    title: 'How to use PDF to Word',
    steps: [
      'Click the upload area or drag and drop your PDF file.',
      'Wait while the file converts to an editable Word (DOCX) document.',
      'When conversion finishes, click Download to save the DOCX file.',
      'Open the file in Microsoft Word or Google Docs to edit it.',
    ],
    tip: 'Scanned PDFs may not convert perfectly—use a text-based PDF for best results.',
  },
  'pdf-to-excel': {
    title: 'How to use PDF to Excel',
    steps: [
      'Upload your PDF containing tables or text.',
      'The tool extracts content and builds an Excel spreadsheet.',
      'Download the .xlsx file when processing completes.',
      'Open in Excel or Google Sheets to review and edit data.',
    ],
  },
  'pdf-to-ppt': {
    title: 'How to use PDF to PPT',
    steps: [
      'Select or drop your PDF file into the upload zone.',
      'Each PDF page is converted into a PowerPoint slide.',
      'Download the .pptx file when ready.',
      'Edit slides in PowerPoint as needed.',
    ],
  },
  'pdf-to-image': {
    title: 'How to use PDF to Image',
    steps: [
      'Upload the PDF you want to convert.',
      'Pages are exported as high-quality images in a ZIP file.',
      'Download the ZIP and extract images on your device.',
    ],
  },
  'word-to-pdf': {
    title: 'How to use Word to PDF',
    steps: [
      'Upload a .doc or .docx Word document.',
      'Conversion runs automatically after upload.',
      'Download your PDF when the success message appears.',
    ],
    tip: 'Legacy .doc files are converted on Windows servers with Microsoft Word installed.',
  },
  'word-to-excel': {
    title: 'How to use Word to Excel',
    steps: [
      'Upload a Word document (.doc or .docx).',
      'Text and tables are extracted into Excel sheets.',
      'Download the spreadsheet when conversion completes.',
    ],
  },
  'pdf-merge': {
    title: 'How to use Merge PDF',
    steps: [
      'Add two or more PDF files using the upload button.',
      'Drag files in the list to reorder them if needed.',
      'Click Merge to combine all files into one PDF.',
      'Download the merged document.',
    ],
  },
  'pdf-split': {
    title: 'How to use Split PDF',
    steps: [
      'Upload the PDF you want to split.',
      'Choose mode: extract page range, split by parts, or split all pages.',
      'Enter page numbers (e.g. 1,3,5-8) if using range mode.',
      'Click Split and download the result.',
    ],
  },
  'pdf-compress': {
    title: 'How to use Compress PDF',
    steps: [
      'Upload your PDF file.',
      'Pick a compression level (balanced recommended).',
      'Start compression and wait for processing.',
      'Download the smaller PDF file.',
    ],
  },
  'image-to-pdf': {
    title: 'How to use JPG to PDF',
    steps: [
      'Upload one or more images (JPG, PNG, WebP).',
      'Reorder images using the arrow buttons if needed.',
      'Click Convert to create a single PDF.',
      'Download your combined PDF.',
    ],
  },
  'pdf-vault': {
    title: 'How to use PDF Secure Vault',
    steps: [
      'Choose Protect PDF or Unlock PDF mode.',
      'Upload your PDF and enter a password.',
      'Click Process to encrypt or remove password protection.',
      'Download the secured or unlocked PDF.',
    ],
    tip: 'Keep your password safe—protected files cannot be opened without it.',
  },
  'pdf-rotate': {
    title: 'How to use Rotate PDF',
    steps: [
      'Upload the PDF to rotate.',
      'Select rotation angle (90°, 180°, or 270°).',
      'Optionally limit rotation to specific pages.',
      'Apply rotation and download the updated PDF.',
    ],
  },
  'pdf-watermark': {
    title: 'How to use Watermark PDF',
    steps: [
      'Upload your PDF document.',
      'Enter watermark text and adjust size, opacity, and position.',
      'Apply the watermark to preview the result.',
      'Download the watermarked PDF.',
    ],
  },
  'pdf-editor': {
    title: 'How to use PDF Editor',
    steps: [
      'Upload your PDF — we convert it to an editable document (processing screen).',
      'Highlight text in the live view to change font (e.g. Times New Roman), color, or underline.',
      'Add images, watermarks, rotate and resize elements; use corner dots on images to resize.',
      'Click Save as PDF to convert back and download your edited PDF.',
    ],
    tip: 'Uses the same PDF to Word and Word to PDF engines as our convert tools. Word to PDF needs Microsoft Word on the server (Windows).',
  },
  'html-to-pdf': {
    title: 'How to use HTML to PDF',
    steps: [
      'Paste HTML code or upload an .html file.',
      'Review your content in the text area.',
      'Click Convert to generate a PDF.',
      'Download the formatted PDF output.',
    ],
  },
  'gmaps-scraper': {
    title: 'How to use G-Maps Scraper',
    steps: [
      'Enter a business industry (e.g. "restaurants", "dentists").',
      'Enter a location (city or area).',
      'Set how many results you want (start with 10 for testing).',
      'Click Start Scraping and wait—this can take several minutes.',
      'Download the Excel file with business names, phones, emails, and links.',
    ],
    tip: 'Requires the backend server running. Chrome/WebDriver must be available on the server.',
  },
  'ai-summarizer': {
    title: 'How to use AI Summarizer',
    steps: [
      'Click the upload area and select a PDF, DOCX, or TXT file (max ~10MB).',
      'Click Generate AI Summary after the file is selected.',
      'Wait 5–30 seconds while Llama AI reads and summarizes your document.',
      'Copy or download the summary, or summarize another file.',
    ],
    tip: 'If Word files fail, re-save as a new .docx in Microsoft Word or use PDF/TXT.',
  },
  translator: {
    title: 'How to use Document Translator',
    steps: [
      'Choose source language (or Auto Detect) and target language.',
      'Upload a PDF, DOCX, or TXT document.',
      'Click Translate Now and wait—large files take longer.',
      'Read original and translated text side by side; copy or download as .txt.',
    ],
    tip: 'Ensure the backend server is running. Re-save problematic Word files before uploading.',
  },
  'resume-builder': {
    title: 'How to use Resume Builder',
    steps: [
      'Pick a template that fits your style and industry.',
      'Fill in personal info, experience, education, and skills.',
      'Use the live preview to check layout and spacing.',
      'Download your resume as PDF when finished.',
    ],
  },
  'ocr-tesseract': {
    title: 'How to use OCR',
    steps: [
      'Upload a scanned PDF or image (PNG, JPG, TIFF, etc.).',
      'Choose the OCR language matching your document.',
      'Click Extract Text and wait while the file is processed.',
      'Copy the result or download as a .txt file.',
    ],
    tip: 'Run scripts/setup-tesseract.ps1 on the server for first-time setup. Add languages via .traineddata files in python-backend/tessdata.',
  },
  'qr-studio': {
    title: 'How to use QR Studio',
    steps: [
      'Scan: upload a QR image or use your camera to decode a code.',
      'Generate: enter a URL or text, customize colors and size.',
      'Download the QR as PNG or SVG.',
      'Copy decoded text or open links directly from results.',
    ],
  },
};

export const HOT_TOOL_LINKS = new Set([
  '/tools/intelligence/summarizer',
  '/tools/intelligence/translator',
  '/tools/pdf-to-word',
  '/tools/automation/gmaps-scraper',
  '/tools/pdf-editor',
  '/tools/qr-studio',
  '/tools/ocr',
]);

export function isHotTool(linkTo) {
  return HOT_TOOL_LINKS.has(linkTo);
}
