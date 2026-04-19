import { isHiddenStyleCode, type HiddenStyleCode } from './munResult';

/** `public/mascots/` 下纯 ASCII 文件名，避免 Windows/部署环境中文路径异常 */
const HIDDEN_MASCOT_PUBLIC: Record<HiddenStyleCode, string> = {
  HIDDEN_LEADER: 'hidden-leader.png',
  HIDDEN_OBSERVER: 'hidden-observer.png',
  HIDDEN_EXPERT: 'hidden-expert.png',
  HIDDEN_VERSATILE: 'hidden-versatile.png',
  HIDDEN_GAME_CHANGER: 'hidden-game-changer.png',
  HIDDEN_BALANCER: 'hidden-balancer.png',
  HIDDEN_ESTABLISHMENT: 'hidden-establishment.png',
  HIDDEN_STRATEGIST: 'hidden-strategist.png',
};

/**
 * 结果页头图小人，对应 `public/mascots/`（Vite 原样复制到 dist）。
 */
export function getResultMascotUrl(resultCode: string): string | null {
  let file: string | null = null;
  if (isHiddenStyleCode(resultCode)) file = HIDDEN_MASCOT_PUBLIC[resultCode];
  else if (/^[AC][EI][SN][PB]$/.test(resultCode)) file = `${resultCode}.png`;
  if (!file) return null;
  return `/mascots/${file}`;
}
