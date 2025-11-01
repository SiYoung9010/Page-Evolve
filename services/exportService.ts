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
    scale: 2,
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

const downloadCanvas = (canvas: HTMLCanvasElement, fileName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to create image blob from canvas.'));
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resolve();
        }, 'image/png', 0.95);
    });
};

/**
 * Exports the full scrollable page within the iframe as an image,
 * splitting it into multiple files if it's too long or if slice positions are provided.
 */
export const exportFullPageAsImage = async (
  iframeId: string = 'preview-iframe',
  fileName: string = 'full-page.png',
  slicePositions: number[] = []
): Promise<void> => {
  const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
  
  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
    throw new Error('Preview iframe or its content is not accessible.');
  }
  
  const doc = iframe.contentDocument;
  const body = doc.body;
  const html = doc.documentElement;

  const fullHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  const SCALE = 2;

  const mainCanvas = await html2canvas(body, {
    backgroundColor: '#ffffff',
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
    logging: false,
    height: fullHeight,
    windowHeight: fullHeight,
  });

  const canvasHeight = mainCanvas.height;
  const canvasWidth = mainCanvas.width;
  const baseFileName = fileName.replace(/\.png$/, '');

  let boundaries: number[];

  if (slicePositions.length > 0) {
    const scaledPositions = slicePositions.map(p => p * SCALE);
    boundaries = [0, ...scaledPositions.filter(p => p < canvasHeight), canvasHeight];
  } else {
    const MAX_HEIGHT = 5000 * SCALE;
    if (canvasHeight <= MAX_HEIGHT) {
      await downloadCanvas(mainCanvas, fileName);
      return;
    }
    boundaries = [];
    for (let y = 0; y < canvasHeight; y += MAX_HEIGHT) {
      boundaries.push(y);
    }
    boundaries.push(canvasHeight);
  }

  const uniqueBoundaries = [...new Set(boundaries)].sort((a, b) => a - b).filter(p => p <= canvasHeight);

  if (uniqueBoundaries.length <= 1) {
      await downloadCanvas(mainCanvas, fileName);
      return;
  }

  for (let i = 0; i < uniqueBoundaries.length - 1; i++) {
    const startY = uniqueBoundaries[i];
    const endY = uniqueBoundaries[i + 1];
    const sliceHeight = endY - startY;

    if (sliceHeight <= 0) continue;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvasWidth;
    sliceCanvas.height = sliceHeight;
    const sliceCtx = sliceCanvas.getContext('2d');

    if (!sliceCtx) {
        console.error('Could not get context for slice canvas');
        continue;
    }

    sliceCtx.drawImage(
      mainCanvas,
      0, startY,
      canvasWidth, sliceHeight,
      0, 0,
      canvasWidth, sliceHeight
    );
    
    const partFileName = `${baseFileName}_part_${i + 1}.png`;
    await downloadCanvas(sliceCanvas, partFileName);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};