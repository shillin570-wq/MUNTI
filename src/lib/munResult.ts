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
  return {
    s: (getAdjustedScore(answers, 1) + getAdjustedScore(answers, 3) + getAdjustedScore(answers, 4) + getAdjustedScore(answers, 5) + getAdjustedScore(answers, 2)) / 5,
    e: (getAdjustedScore(answers, 6) + getAdjustedScore(answers, 8) + getAdjustedScore(answers, 10) + getAdjustedScore(answers, 7) + getAdjustedScore(answers, 9)) / 5,
    t: (getAdjustedScore(answers, 11) + getAdjustedScore(answers, 13) + getAdjustedScore(answers, 14) + getAdjustedScore(answers, 12) + getAdjustedScore(answers, 15)) / 5,
    m: (getAdjustedScore(answers, 16) + getAdjustedScore(answers, 19) + getAdjustedScore(answers, 17) + getAdjustedScore(answers, 18) + getAdjustedScore(answers, 20)) / 5,
  };
}

/** 基于四维折算分的 8 种「稀有剖面」隐藏款（与 computeResultCode 返回值一致） */
export const HIDDEN_STYLE_CODES = [
  'HIDDEN_SUMMIT',
  'HIDDEN_ABYSS',
  'HIDDEN_SPIRE',
  'HIDDEN_DIAD',
  'HIDDEN_TEMPEST',
  'HIDDEN_PLATEAU',
  'HIDDEN_HIGHFLOOR',
  'HIDDEN_LOWCEILING',
] as const;

export type HiddenStyleCode = (typeof HIDDEN_STYLE_CODES)[number];

export function isHiddenStyleCode(code: string): code is HiddenStyleCode {
  return (HIDDEN_STYLE_CODES as readonly string[]).includes(code);
}

/**
 * 四字母十六型；若四维折算后出现「统计上少见的剖面」，则返回隐藏款而非四码。
 * 隐藏款仅依据 s/e/t/m 四维均分判定，与单题是否全选某数、奇偶模式等无关。
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

  if (minD >= 4.35) return 'HIDDEN_SUMMIT';
  if (maxD <= 1.65) return 'HIDDEN_ABYSS';
  if (spike === 1 && low3 === 3) return 'HIDDEN_SPIRE';
  if (hi === 2 && lo === 2) return 'HIDDEN_DIAD';
  if (spread >= 2.25) return 'HIDDEN_TEMPEST';
  if (spread <= 0.42 && meanD >= 2.72 && meanD <= 3.28) return 'HIDDEN_PLATEAU';
  if (minD >= 3.85) return 'HIDDEN_HIGHFLOOR';
  if (maxD <= 2.15) return 'HIDDEN_LOWCEILING';

  const sCode = sScore > 3 ? 'C' : 'A';
  const eCode = eScore > 3 ? 'E' : 'I';
  const tCode = tScore > 3 ? 'S' : 'N';
  const mCode = mScore > 3 ? 'P' : 'H';

  return `${sCode}${eCode}${tCode}${mCode}`;
}

export function dimensionLabels(): { key: keyof DimensionScores; title: string; high: string; low: string }[] {
  return [
    { key: 's', title: '策略倾向 (S)', high: '协作 / 共识', low: '竞争 / 捍卫' },
    { key: 'e', title: '表达风格 (E)', high: '煽动 / 气场', low: '逻辑 / 数据' },
    { key: 't', title: '文本关注 (T)', high: '细节 / 条款', low: '大局 / 架构' },
    { key: 'm', title: '游说手段 (M)', high: '公开 / 动议', low: '幕后 / 私聊' },
  ];
}

/** 四字母码每一位对应的英文锚词（与 computeResultCode 中 C/A、E/I、S/N、P/H 一致） */
export const RESULT_LETTER_EN: Record<
  string,
  { word: string; phraseZh: string }
> = {
  C: { word: 'Collaboration', phraseZh: '协作与共识取向。' },
  A: { word: 'Assertive', phraseZh: '竞争与捍卫取向。' },
  E: { word: 'Expressive', phraseZh: '气场、叙事与现场说服。' },
  I: { word: 'Informative', phraseZh: '逻辑、数据与书面论证。' },
  S: { word: 'Specifics', phraseZh: '条款、细节与可执行性。' },
  N: { word: 'Narrative', phraseZh: '愿景、架构与方向框架。' },
  P: { word: 'Public', phraseZh: '全体会议、动议与可见议程行动。' },
  H: { word: 'Hidden', phraseZh: '走廊、私下磋商与小范围议价。' },
};
