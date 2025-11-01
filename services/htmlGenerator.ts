import { PagePlan, Block } from '../types';

// FIX: Moved escapeHtml to the module scope to be accessible by generateHtml.
const escapeHtml = (unsafe: string) => {
  if (typeof unsafe !== 'string') return "";
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
};

const generateBlockHtml = (block: Block, index: number): string => {
  // Sanitize content before rendering

  switch (block.type) {
    case 'heading':
      return `<h${block.level || 1} data-block-index="${index}">${escapeHtml(block.content as string)}</h${block.level || 1}>`;
    case 'text':
      // Allow simple HTML like <b> or <i> in text, but be careful.
      // A more robust solution would use a proper sanitizer here if complex HTML is needed.
      return `<p data-block-index="${index}">${block.content}</p>`;
    case 'image':
      return `<img src="${escapeHtml(block.content as string)}" data-block-index="${index}" style="max-width: 100%; height: auto; border-radius: 10px;" alt="" />`;
    case 'list':
      if (Array.isArray(block.content)) {
        const listItems = block.content.map(item => `  <li>${escapeHtml(item)}</li>`).join('\n');
        return `<ul data-block-index="${index}">\n${listItems}\n</ul>`;
      }
      return '';
    default:
      return '';
  }
};

export const generateHtml = (pagePlan: PagePlan): string => {
  if (!pagePlan || !pagePlan.blocks) {
    return `<!DOCTYPE html><html><head><title>Error</title></head><body>Invalid PagePlan data.</body></html>`;
  }
  const blocksHtml = pagePlan.blocks.map((block, index) => generateBlockHtml(block, index)).join('\n\n  ');
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pagePlan.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { font-size: 32px; }
    h2 { font-size: 24px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 40px;}
    p { line-height: 1.6; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  ${blocksHtml}
</body>
</html>`;
};