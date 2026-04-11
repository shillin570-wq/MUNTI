import { questions } from '../data';

export type DimensionScores = {
  s: number;
  e: number;
  t: number;
  m: number;
};

function getAdjustedScore(answers: Record<number, number>, id: number): number {
  const q = questions.find((x) => x.id === id);
  const val = answers[id] ?? 3;
  return q?.reverse ? 6 - val : val;
}

export function getDimensionScores(answers: Record<number, number>): DimensionScores {
  const sum = (ids: number[]) => ids.reduce((acc, id) => acc + getAdjustedScore(answers, id), 0) / ids.length;
  return {
    s: sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    e: sum([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
    t: sum([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
    m: sum([31, 32, 33, 34, 35, 36, 37, 38, 39, 40]),
  };
}

/** 基于四维折算分的 8 种「稀有剖面」隐藏款（与 computeResultCode 返回值一致） */
export const HIDDEN_STYLE_CODES = [
  'HIDDEN_LEADER',
  'HIDDEN_OBSERVER',
  'HIDDEN_EXPERT',
  'HIDDEN_VERSATILE',
  'HIDDEN_GAME_CHANGER',
  'HIDDEN_BALANCER',
  'HIDDEN_ESTABLISHMENT',
  'HIDDEN_STRATEGIST',
] as const;

export type HiddenStyleCode = (typeof HIDDEN_STYLE_CODES)[number];

export function isHiddenStyleCode(code: string): code is HiddenStyleCode {
  return (HIDDEN_STYLE_CODES as readonly string[]).includes(code);
}

/**
 * 四字母十六型；若四维折算后出现「统计上少见的剖面」，则返回隐藏款而非四码。
 *
 * 隐藏款触发逻辑（按优先级依次判断）：
 *  领袖 Leader HIDDEN_LEADER — 四维最低分 ≥ 4.35，全频高配
 *  观察者 Observer       HIDDEN_OBSERVER    — 四维最高分 ≤ 1.65，全维深潜
 *  专家 Expert           HIDDEN_EXPERT      — 恰 1 维 ≥ 4.5 且另 3 维 ≤ 2.9，单轴极致
 *  多面手 Versatile      HIDDEN_VERSATILE   — 恰 2 维 ≥ 3.85 且恰 2 维 ≤ 2.15，双极并存
 *  破局者 Game Changer   HIDDEN_GAME_CHANGER — 四维极差 ≥ 2.25，内部剧烈落差
 *  平衡者 Balancer       HIDDEN_BALANCER    — 极差 ≤ 0.42 且均值在 2.72–3.28，均衡中轨
 *  建制派 Establishment  HIDDEN_ESTABLISHMENT — 四维最低分 ≥ 3.85（低于领袖阈值），高水平线无弱点
 *  战略家 Strategist     HIDDEN_STRATEGIST — 四维最高分 ≤ 2.15（高于观察者阈值），低姿态全线克制
 */
export function computeResultCode(answers: Record<number, number>): string {
  const dims = getDimensionScores(answers);
  const { s: sScore, e: eScore, t: tScore, m: mScore } = dims;
  const arr = [sScore, eScore, tScore, mScore];
  const minD = Math.min(...arr);
  const maxD = Math.max(...arr);
  const spread = maxD - minD;
  const meanD = arr.reduce((a, b) => a + b, 0) / 4;
  const hi = arr.filter((d) => d >= 3.85).length;
  const lo = arr.filter((d) => d <= 2.15).length;
  const spike = arr.filter((d) => d >= 4.5).length;
  const low3 = arr.filter((d) => d <= 2.9).length;

  if (minD >= 4.35) return 'HIDDEN_LEADER';
  if (maxD <= 1.65) return 'HIDDEN_OBSERVER';
  if (spike === 1 && low3 === 3) return 'HIDDEN_EXPERT';
  if (hi === 2 && lo === 2) return 'HIDDEN_VERSATILE';
  if (spread >= 2.25) return 'HIDDEN_GAME_CHANGER';
  if (spread <= 0.42 && meanD >= 2.72 && meanD <= 3.28) return 'HIDDEN_BALANCER';
  if (minD >= 3.85) return 'HIDDEN_ESTABLISHMENT';
  if (maxD <= 2.15) return 'HIDDEN_STRATEGIST';

  const sCode = sScore > 3 ? 'C' : 'A';
  const eCode = eScore > 3 ? 'E' : 'I';
  const tCode = tScore > 3 ? 'S' : 'N';
  const mCode = mScore > 3 ? 'P' : 'B';

  return `${sCode}${eCode}${tCode}${mCode}`;
}

export function dimensionLabels(): { key: keyof DimensionScores; title: string; high: string; low: string }[] {
  return [
    {
      key: 's',
      title: '策略（S）· 协商 vs 捍卫',
      high: '并案折中、互让一步、写进可表决案文',
      low: '划线守底、公开对峙、底线先于共识',
    },
    {
      key: 'e',
      title: '表达（E）· 气场 vs 书证',
      high: '讲台结构、临场叙事、全场能见度',
      low: '脚注数据、书面质询、以稿代讲',
    },
    {
      key: 't',
      title: '文本（T）· 颗粒 vs 框架',
      high: '条款颗粒、逻辑闭环、义务可追责',
      low: '章节骨架、愿景留白、细节后移',
    },
    {
      key: 'm',
      title: '游说（M）· 台前 vs 幕后',
      high: '全会动议、有主持磋商、公开博弈',
      low: '茶歇耳语、走廊议价、双边小圈',
    },
  ];
}

/** 四字母码每一位对应的英文锚词（与 computeResultCode 中 C/A、E/I、S/N、P/H 一致） */
export const RESULT_LETTER_EN: Record<
  string,
  { word: string; phraseZh: string }
> = {
  C: { word: 'Collaboration', phraseZh: '策略上偏「织网并案」：愿为可表决文本付协调成本。' },
  A: { word: 'Assertive', phraseZh: '策略上偏「划线捍卫」：愿为底线承受公开对峙与延宕。' },
  E: { word: 'Expressive', phraseZh: '表达上偏「台前气场」：主发言、举牌与可见议程动作。' },
  I: { word: 'Informative', phraseZh: '表达上偏「书证脚注」：数据、工作文件与质询稿。' },
  S: { word: 'Specifics', phraseZh: '文本上偏「条款颗粒」：义务、编号、可追责与闭环。' },
  N: { word: 'Narrative', phraseZh: '文本上偏「愿景框架」：章节骨架、方向句与后移细节。' },
  P: { word: 'Public', phraseZh: '游说上偏「台前博弈」：全会、动议与公开拉票。' },
  B: { word: 'Backchannel', phraseZh: '游说上偏「幕后议价」：走廊、茶歇与小范围双边。' },
};
