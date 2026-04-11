import { toPng } from 'html-to-image';

export type CaptureSlot = { el: HTMLElement | null | undefined; fileLabel: string };

const PNG_OPTS = {
  pixelRatio: 2,
  cacheBust: true,
} as const;

/** 按顺序将各板块导出为独立 PNG（浏览器可能提示允许多文件下载） */
export async function downloadResultSectionPngs(
  filePrefix: string,
  slots: CaptureSlot[],
): Promise<void> {
  let index = 0;
  for (const { el, fileLabel } of slots) {
    if (!el) continue;
    index += 1;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const dataUrl = await toPng(el, PNG_OPTS);
    const link = document.createElement('a');
    link.download = `${filePrefix}-${String(index).padStart(2, '0')}-${fileLabel}.png`;
    link.href = dataUrl;
    link.click();
    await new Promise((r) => setTimeout(r, 280));
  }
}
