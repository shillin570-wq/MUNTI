import { toPng } from 'html-to-image';

const PNG_OPTS = {
  pixelRatio: 2,
  cacheBust: true,
} as const;

const MARGIN = 32;
const QR_FOOTER_GAP = 28;
/** 说明语与二维码之间的间距（二维码在左、说明在右，与「扫码左侧二维码」一致） */
const TEXT_QR_GAP = 14;
const QR_MAX_RATIO = 0.34;
const QR_MIN = 108;
const QR_MAX = 260;

/** 说明语：加粗、偏大，在二维码右侧 */
const HINT_FONT_WEIGHT = 700;
const HINT_FONT_SIZE = 30;
const HINT_LINE_HEIGHT = 42;
const HINT_FONT_FAMILY = 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
const HINT_TEXT_COLOR = '#0f172a';

/** 与排版一致：说明在左、二维码在右，故写作「扫码左侧二维码」 */
export const RESULT_QR_HINT_ZH = '扫码左侧二维码，关注春秋模联公众号回复 MUNTI 获取测试';

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

/**
 * html-to-image 对「移出视口」的节点常导出空白图，截图瞬间拉到 (0,0) 再还原。
 */
function prepareCompositeForCapture(el: HTMLElement): () => void {
  const prev = {
    transform: el.style.transform,
    position: el.style.position,
    left: el.style.left,
    top: el.style.top,
    zIndex: el.style.zIndex,
    opacity: el.style.opacity,
    visibility: el.style.visibility,
    clipPath: el.style.clipPath,
  };
  el.style.transform = 'none';
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.top = '0';
  el.style.zIndex = '2147483646';
  el.style.opacity = '1';
  el.style.visibility = 'visible';
  el.style.clipPath = 'none';

  return () => {
    el.style.transform = prev.transform;
    el.style.position = prev.position;
    el.style.left = prev.left;
    el.style.top = prev.top;
    el.style.zIndex = prev.zIndex;
    el.style.opacity = prev.opacity;
    el.style.visibility = prev.visibility;
    el.style.clipPath = prev.clipPath;
  };
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('无法导出 PNG'))),
      'image/png',
      1,
    );
  });
}

/**
 * 移动端优先调系统分享（可「存储到照片」）；桌面或不支持时走下载链接。
 */
async function savePngBlob(blob: Blob, filename: string): Promise<void> {
  if (typeof File !== 'undefined' && typeof navigator !== 'undefined' && navigator.share) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: '春秋模联 · 测试结果',
          text: '模联人格测试结果图',
        });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (e instanceof Error && e.name === 'AbortError') return;
        /* 继续尝试下载 */
      }
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
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
  /** 离屏渲染的整页报告根节点（MBTI 式布局 + 类型描述，不含维度条） */
  compositeEl: HTMLElement | null | undefined;
  contactQrSrc?: string;
  qrHintText?: string;
};

/**
 * 导出单张测试结果图：报告式整页截图 + 底部说明语（左）与公众号二维码（右）并排。
 */
export async function downloadResultComposite(
  filePrefix: string,
  {
    compositeEl,
    contactQrSrc = DEFAULT_QR_SRC,
    qrHintText = RESULT_QR_HINT_ZH,
  }: DownloadCompositeOptions,
): Promise<void> {
  if (!compositeEl) {
    throw new Error('缺少报告导出区域，无法生成图片');
  }

  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  const restoreComposite = prepareCompositeForCapture(compositeEl);
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  let compositeDataUrl: string;
  try {
    await new Promise((r) => setTimeout(r, 80));
    compositeDataUrl = await toPng(compositeEl, {
      ...PNG_OPTS,
      /** 避免裁到视口外像素 */
      skipAutoScale: true,
    });
  } finally {
    restoreComposite();
  }

  const reportImg = await loadImage(compositeDataUrl);
  if (reportImg.width < 16 || reportImg.height < 16) {
    throw new Error('截图内容为空，请重试或更换浏览器');
  }

  let qrImg: HTMLImageElement | null = null;
  try {
    qrImg = await loadImage(contactQrSrc);
  } catch {
    /* 可选 */
  }

  const contentWidth = reportImg.width;
  const reportDrawH = reportImg.height;

  const canvasW = MARGIN * 2 + contentWidth;

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

    qrX = MARGIN;

    const textStartAfterQr = qrX + qrSize + TEXT_QR_GAP;
    const textMaxW = Math.max(80, MARGIN + contentWidth - textStartAfterQr);

    const ctxMeasure = document.createElement('canvas').getContext('2d');
    if (!ctxMeasure) throw new Error('无法创建画布');
    ctxMeasure.font = hintFontCss();
    textLines = qrHintText.trim() ? wrapLines(ctxMeasure, qrHintText, textMaxW) : [];

    const textBlockH =
      textLines.length > 0 ? textLines.length * HINT_LINE_HEIGHT : HINT_LINE_HEIGHT;
    const rowInnerH = Math.max(qrSize, textBlockH);

    const qrRowTop = MARGIN + reportDrawH + QR_FOOTER_GAP;
    qrY = qrRowTop + (rowInnerH - qrSize) / 2;

    textStartX = textStartAfterQr;
    textStartY = qrRowTop + (rowInnerH - textBlockH) / 2;

    footerH = QR_FOOTER_GAP + rowInnerH;
  }

  const canvasH = MARGIN + reportDrawH + footerH + MARGIN;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.drawImage(reportImg, MARGIN, MARGIN, contentWidth, reportDrawH);

  if (qrImg) {
    ctx.font = hintFontCss();
    ctx.fillStyle = HINT_TEXT_COLOR;
    ctx.textBaseline = 'top';
    textLines.forEach((ln, i) => {
      ctx.fillText(ln, textStartX, textStartY + i * HINT_LINE_HEIGHT);
    });
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  const filename = `${filePrefix}-测试结果.png`;
  const blob = await canvasToPngBlob(canvas);
  await savePngBlob(blob, filename);
}
