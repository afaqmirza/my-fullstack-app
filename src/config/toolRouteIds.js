/** Map route pathname → toolInstructions key */
export const PATH_TO_TOOL_ID = {
  '/tools/word-to-pdf': 'word-to-pdf',
  '/tools/word-to-excel': 'word-to-excel',
  '/tools/pdf-to-ppt': 'pdf-to-ppt',
  '/tools/pdf-to-image': 'pdf-to-image',
  '/tools/pdf-to-excel': 'pdf-to-excel',
  '/tools/pdf-to-word': 'pdf-to-word',
  '/tools/pdf-merge': 'pdf-merge',
  '/tools/pdf-split': 'pdf-split',
  '/tools/pdf-compress': 'pdf-compress',
  '/tools/image-to-pdf': 'image-to-pdf',
  '/tools/image-to-base64': 'image-to-base64',
  '/tools/pdf-vault': 'pdf-vault',
  '/tools/pdf-rotate': 'pdf-rotate',
  '/tools/pdf-watermark': 'pdf-watermark',
  '/tools/pdf-editor': 'pdf-editor',
  '/tools/html-to-pdf': 'html-to-pdf',
  '/tools/automation/gmaps-scraper': 'gmaps-scraper',
  '/tools/intelligence/summarizer': 'ai-summarizer',
  '/tools/intelligence/translator': 'translator',
  '/tools/resume-builder': 'resume-builder',
  '/tools/qr-studio': 'qr-studio',
  '/tools/ocr': 'ocr-tesseract',
};

export function getToolIdFromPath(pathname) {
  return PATH_TO_TOOL_ID[pathname] || null;
}
