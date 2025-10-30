// services/exportService.ts
import html2canvas from 'html2canvas';

/**
 * Exports the visible content of the preview iframe as an image.
 */
export const exportPreviewAsImage = async (
  iframeId: string = 'preview-iframe',
  fileName: string = 'page-preview.png',
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<void> => {
  const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
  
  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
    throw new Error('Preview iframe or its content is not accessible.');
  }
  
  const body = iframe.contentDocument.body;
  
  const canvas = await html2canvas(body, {
    backgroundColor: '#ffffff',
    scale: 2, // For higher resolution
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
  
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create image blob from canvas.');
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, `image/${format}`, quality);
};

/**
 * Exports the full scrollable page within the iframe as an image.
 */
export const exportFullPageAsImage = async (
  iframeId: string = 'preview-iframe',
  fileName: string = 'full-page.png'
): Promise<void> => {
  const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
  
  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
    throw new Error('Preview iframe or its content is not accessible.');
  }
  
  const doc = iframe.contentDocument;
  const body = doc.body;
  const html = doc.documentElement;

  // Get the full height of the content
  const fullHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

  const canvas = await html2canvas(body, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    height: fullHeight,
    windowHeight: fullHeight,
  });
  
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create image blob from canvas.');
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png', 0.95);
};