/** 结果页「复制链接」使用的正式站点（与当前访问域名无关） */
export const COPY_LINK_URL = 'https://www.munti.cn/';

/** 构建时配置的站点根（无末尾斜杠），与 index.html 中 og:url 同源 */
export function getSiteBaseUrl(): string {
  return (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '') ?? '';
}

/**
 * 「转发分享」里附带的测试页链接。
 * 配置了 VITE_SITE_URL 时用其作为规范域名，并与当前 pathname/search/hash 拼接（适合已绑定正式域名、或希望分享链接始终指向生产站）。
 * 未配置时退回当前页 href（本地或任意访问地址）。
 */
export function getSharePageUrl(): string {
  const base = getSiteBaseUrl();
  if (!base) return window.location.href;
  const tail = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `${base}${tail.startsWith('/') ? tail : `/${tail}`}`;
}
