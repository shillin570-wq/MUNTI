import type { RefObject } from 'react';
import { styles } from '../../data';
import { getWittyEssay } from '../../data/wittyEssays';
import type { DimensionScores, HiddenStyleCode } from '../../lib/munResult';
import type { StandardCaptureRefs } from '../StandardResultSections';
import { StandardResultSections } from '../StandardResultSections';
import {
  CircleDot,
  Landmark,
  Mountain,
  SplitSquareHorizontal,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** 与中文名对应的对外英文标签（分享文案等） */
export function hiddenSpecialLabel(code: HiddenStyleCode): string {
  const s = styles[code];
  if (s?.nameEn && s?.name) return `SPECIAL · ${s.nameEn}（${s.name}）`;
  if (s?.name) return `SPECIAL·${s.name}`;
  return code;
}

// ── 仅供 buildHiddenShareText 使用 ──────────────────────────────────

const HIDDEN_WHY: Record<HiddenStyleCode, { icon: LucideIcon; accent: string; trigger: string }> = {
  HIDDEN_LEADER: {
    icon: Mountain,
    accent: 'text-amber-800',
    trigger:
      '含反向题折算后，策略、表达、文本、游说四维均分的最低分仍不低于约 4.35——你在自陈上几乎不留任何短板，四条战线同时站在高原。这种"全频高配"在人群里极为罕见，正是领袖型的统计印记：一个人同时驾驭了常人需要整支团队才能覆盖的全部维度。',
  },
  HIDDEN_OBSERVER: {
    icon: Waves,
    accent: 'text-slate-700',
    trigger:
      '四维均分的最高分仍不高于约 1.65——你把所有维度都收缩到了最内敛的极点。这不是能力的缺失，而是一种极度克制的战略性静默：你将百分之九十九的能量储存在水面之下，等待那百分之一的定局时刻再出手。多数人至少会在某一维上保留"在场感"，而你选择了全维度的深潜。',
  },
  HIDDEN_EXPERT: {
    icon: Landmark,
    accent: 'text-orange-800',
    trigger:
      '恰有一条维度 ≥ 约 4.5，且另三条均 ≤ 约 2.9——你将所有天赋与政治资源毫无保留地倾注在了一条极致的轴线上，其余维度则自陈极低。这是专家型的典型剖面：不屑做面面俱到的通才，只打磨那把最锋利的单刃剑，只要会议进入你所统治的垂直领域，便能爆发出绝对统治力。',
  },
  HIDDEN_VERSATILE: {
    icon: SplitSquareHorizontal,
    accent: 'text-violet-800',
    trigger:
      '恰有两条维度 ≥ 约 3.85，且恰有两条 ≤ 约 2.15——"一半燃烧、一半关机"的对角式组合。这是多面手型的统计特征：台前是激情演说家，台下是冷酷文本切割机；或在底线前寸步不让，却又热衷于茶歇时的私下温和交易。两种极端属性的完美融合，让你成为全场最难被预测的终极变量。',
  },
  HIDDEN_GAME_CHANGER: {
    icon: Wind,
    accent: 'text-cyan-800',
    trigger:
      '四维最高分与最低分之差 ≥ 约 2.25——你允许自己在极度的渴望与极度的冷漠之间自由切换，四条维度之间存在剧烈的内部落差。这是破局者的标志：拒绝被任何单一政治标签束缚，正是这种常人难以理解的剧烈反差，赋予了你打破僵局、在无路可走处劈出大道的奇迹般能力。',
  },
  HIDDEN_BALANCER: {
    icon: CircleDot,
    accent: 'text-sky-800',
    trigger:
      '四维极差 ≤ 约 0.42，且均值落在约 2.72–3.28——四条维度彼此咬合紧密，又都稳稳锚定在量表中位线附近。这是平衡者的统计画像：不带任何极端锋芒，对情绪化攻击和意识形态陷阱天然免疫，每个阵营都能在你身上找到安全感。黄金分割般的均衡感，让你成为全场最容易被各方接受的最大公约数本身。',
  },
  HIDDEN_ESTABLISHMENT: {
    icon: TrendingUp,
    accent: 'text-emerald-800',
    trigger:
      '四维最低分仍 ≥ 约 3.85，但未达到「领袖」的更严阈值——你极其聪明地将所有维度维持在了一个毫无弱点的高水平线上。这是建制派的剖面：没有将自己逼入极限状态，而是以持续且稳定的高质量输出，让任何试图寻找突破口的对手最终因找不到短板而感到绝望。',
  },
  HIDDEN_STRATEGIST: {
    icon: TrendingDown,
    accent: 'text-slate-600',
    trigger:
      '四维最高分仍 ≤ 约 2.15，但未落入「观察者」的更极端区间——你同步克制了在所有维度上的表现欲，像一朵低垂的云层，不显山不露水。这是战略家的打法：深谙"多做多错"，将低姿态作为成本最低的防御术，在所有人精疲力尽、防线松懈的关键时刻，用最小的动作完成那次决定性的表态。',
  },
};

// ── 头图渐变色 ───────────────────────────────────────────────────────

export function getHiddenHeaderClass(code: HiddenStyleCode): string {
  const map: Record<HiddenStyleCode, string> = {
    HIDDEN_LEADER:     'from-amber-400 via-orange-500 to-rose-600',
    HIDDEN_OBSERVER:      'from-slate-700 via-slate-800 to-zinc-950',
    HIDDEN_EXPERT:      'from-orange-500 via-amber-600 to-yellow-700',
    HIDDEN_VERSATILE:       'from-violet-600 via-purple-600 to-fuchsia-700',
    HIDDEN_GAME_CHANGER:    'from-cyan-600 via-sky-600 to-blue-800',
    HIDDEN_BALANCER:   'from-sky-400 via-cyan-500 to-teal-600',
    HIDDEN_ESTABLISHMENT:  'from-emerald-500 via-teal-600 to-cyan-700',
    HIDDEN_STRATEGIST: 'from-slate-500 via-slate-600 to-slate-800',
  };
  return map[code];
}

// ── 隐藏款正文（与普通款完全相同的五板块布局）────────────────────────

/** capture refs 从外部传入，结构与 StandardCaptureRefs 相同 */
export type HiddenResultCaptureRefs = {
  celebrities: RefObject<HTMLElement | null>;
  essay:       RefObject<HTMLElement | null>;
  dims:        RefObject<HTMLElement | null>;
  letters:     RefObject<HTMLElement | null>;
};

export function HiddenResultBody({
  code,
  dims,
  captureRefs,
}: {
  code: HiddenStyleCode;
  dims: DimensionScores;
  captureRefs?: HiddenResultCaptureRefs;
}) {
  return (
    <StandardResultSections
      resultCode={code}
      dims={dims}
      captureRefs={captureRefs as StandardCaptureRefs | undefined}
    />
  );
}

// ── 分享文案 ─────────────────────────────────────────────────────────

export function buildHiddenShareText(code: HiddenStyleCode, styleName: string): string {
  const w = HIDDEN_WHY[code];
  return [
    `【春秋模联·模联人格测试 · 隐藏款】`,
    `${styleName}（${code}）`,
    '',
    `【为何是隐藏款】${hiddenSpecialLabel(code)}`,
    w.trigger,
    '',
    '【侧写分析】',
    getWittyEssay(code),
    '',
  ].join('\n');
}
