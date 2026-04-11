import { toPng } from 'html-to-image';

const PNG_OPTS = {
  pixelRatio: 2,
  cacheBust: true,
} as const;

const MARGIN = 32;
const GAP = 24;
const QR_FOOTER_GAP = 28;
/** 说明语与二维码之间的间距（靠侧排列） */
const TEXT_QR_GAP = 14;
const QR_MAX_RATIO = 0.34;
const QR_MIN = 108;
const QR_MAX = 260;

/** 说明语：加粗、偏大，紧贴二维码左侧 */
const HINT_FONT_WEIGHT = 700;
const HINT_FONT_SIZE = 30;
const HINT_LINE_HEIGHT = 42;
const HINT_FONT_FAMILY = 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
const HINT_TEXT_COLOR = '#0f172a';

export const RESULT_QR_HINT_ZH = '扫描春秋公众号二维码回复MUNTI获取测试';

const DEFAULT_QR_SRC = '/result-official-qr.png';

function hintFontCss(): string {
  return `${HINT_FONT_WEIGHT} ${HINT_FONT_SIZE}px ${HINT_FONT_FAMILY}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`无法加载图片: ${src}`));
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type DownloadCompositeOptions = {
  headerEl: HTMLElement | null | undefined;
  essayEl: HTMLElement | null | undefined;
  contactQrSrc?: string;
  qrHintText?: string;
};

/**
 * 导出单张测试结果图：头图 + 类型描述 + 底部说明语（左）与公众号二维码（右）并排，不叠在正文上。
 */
export async function downloadResultComposite(
  filePrefix: string,
  {
    headerEl,
    essayEl,
    contactQrSrc = DEFAULT_QR_SRC,
    qrHintText = RESULT_QR_HINT_ZH,
  }: DownloadCompositeOptions,
): Promise<void> {
  if (!headerEl || !essayEl) {
    throw new Error('缺少头图或类型描述区域，无法生成图片');
  }

  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  const [headerDataUrl, essayDataUrl] = await Promise.all([
    toPng(headerEl, PNG_OPTS),
    toPng(essayEl, PNG_OPTS),
  ]);

  const [headerImg, essayImg] = await Promise.all([
    loadImage(headerDataUrl),
    loadImage(essayDataUrl),
  ]);

  let qrImg: HTMLImageElement | null = null;
  try {
    qrImg = await loadImage(contactQrSrc);
  } catch {
    /* 可选 */
  }

  const contentWidth = Math.max(headerImg.width, essayImg.width);

  const hdrScale = contentWidth / headerImg.width;
  const hdrDrawH = Math.round(headerImg.height * hdrScale);

  const essayScale = contentWidth / essayImg.width;
  const essayDrawH = Math.round(essayImg.height * essayScale);

  const canvasW = MARGIN * 2 + contentWidth;
  const essayY = MARGIN + hdrDrawH + GAP;

  let footerH = 0;
  let qrSize = 0;
  let qrX = 0;
  let qrY = 0;
  let textLines: string[] = [];
  let textStartX = MARGIN;
  let textStartY = 0;

  if (qrImg) {
    qrSize = Math.floor(contentWidth * QR_MAX_RATIO);
    qrSize = Math.max(QR_MIN, Math.min(QR_MAX, qrSize));

    qrX = MARGIN + contentWidth - qrSize;

    const textMaxW = Math.max(80, qrX - TEXT_QR_GAP - MARGIN);

    const ctxMeasure = document.createElement('canvas').getContext('2d');
    if (!ctxMeasure) throw new Error('无法创建画布');
    ctxMeasure.font = hintFontCss();
    textLines = qrHintText.trim() ? wrapLines(ctxMeasure, qrHintText, textMaxW) : [];

    const textBlockH =
      textLines.length > 0 ? textLines.length * HINT_LINE_HEIGHT : HINT_LINE_HEIGHT;
    const rowInnerH = Math.max(qrSize, textBlockH);

    const qrRowTop = essayY + essayDrawH + QR_FOOTER_GAP;
    qrY = qrRowTop + (rowInnerH - qrSize) / 2;

    textStartX = MARGIN;
    textStartY = qrRowTop + (rowInnerH - textBlockH) / 2;

    footerH = QR_FOOTER_GAP + rowInnerH;
  }

  const canvasH = MARGIN + hdrDrawH + GAP + essayDrawH + footerH + MARGIN;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.drawImage(headerImg, MARGIN, MARGIN, contentWidth, hdrDrawH);
  ctx.drawImage(essayImg, MARGIN, essayY, contentWidth, essayDrawH);

  if (qrImg) {
    ctx.font = hintFontCss();
    ctx.fillStyle = HINT_TEXT_COLOR;
    ctx.textBaseline = 'top';
    textLines.forEach((ln, i) => {
      ctx.fillText(ln, textStartX, textStartY + i * HINT_LINE_HEIGHT);
    });
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  const out = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filePrefix}-测试结果.png`;
  link.href = out;
  link.click();
}
