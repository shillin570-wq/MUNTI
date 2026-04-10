import { Fragment } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
import { getWittyEssay } from '../../data/wittyEssays';
import { dimensionLabels, type DimensionScores, type HiddenStyleCode } from '../../lib/munResult';
import { Card, CardContent } from '@/components/ui/card';

const HIDDEN_WHY: Record<HiddenStyleCode, { icon: LucideIcon; accent: string; badge: string; trigger: string }> = {
  HIDDEN_SUMMIT: {
    icon: Mountain,
    accent: 'text-amber-800',
    badge: '极罕 · 四维同高',
    trigger:
      '在含反向题的折算后，策略、表达、文本、游说四维均分中的最低分仍不低于约 4.35。表示你在自陈上极少「留短板」，四轴同时站在高原——这类「全频高配」在人群里比例极低，故不归入十六格之一，而单独成款。',
  },
  HIDDEN_ABYSS: {
    icon: Waves,
    accent: 'text-slate-700',
    badge: '极罕 · 四维同低',
    trigger:
      '四维均分中的最高分仍不高于约 1.65。表示你在四条轴线上同步把自我画像压到极低区；与常见「至少一维会为自己留一点」的填答不同，统计上稀少，故单列。',
  },
  HIDDEN_SPIRE: {
    icon: Landmark,
    accent: 'text-orange-800',
    badge: '罕见 · 单轴独峰',
    trigger:
      '恰有一条维度 ≥ 约 4.5，且另三条均 ≤ 约 2.9。即「一柱擎天」式剖面：自我叙事高度集中在一种会场角色上，其余维度自陈明显偏低——与十六型假设的「多轴组合平衡」不一致，故标为稀有款。',
  },
  HIDDEN_DIAD: {
    icon: SplitSquareHorizontal,
    accent: 'text-violet-800',
    badge: '罕见 · 双高双低',
    trigger:
      '恰有两条维度 ≥ 约 3.85，且恰有两条 ≤ 约 2.15。形成「两维燃烧、两维休眠」的对角式组合；此类双峰剖面在随机填答中很难自然出现，算法将其与典型十六型区分对待。',
  },
  HIDDEN_TEMPEST: {
    icon: Wind,
    accent: 'text-cyan-800',
    badge: '稀有 · 极差巨大',
    trigger:
      '四维最高分与最低分之差 ≥ 约 2.25。说明你在协作、表达、文本、游说上的自陈允许强烈内部不一致——「锋面气候」式人格，在样本里相对少见，故单独标注。',
  },
  HIDDEN_PLATEAU: {
    icon: CircleDot,
    accent: 'text-sky-800',
    badge: '稀有 · 窄轨中轨',
    trigger:
      '四维极差 ≤ 约 0.42，且均值落在约 2.72–3.28。四轴彼此咬得很紧又都漂在量表中线附近，难以用 C/A、E/I 等比特清晰切开，属于难标签化的稀有均衡剖面。',
  },
  HIDDEN_HIGHFLOOR: {
    icon: TrendingUp,
    accent: 'text-emerald-800',
    badge: '少见 · 高地板',
    trigger:
      '四维最低分仍 ≥ 约 3.85，但未满足更严格的「四岳同辉」条件。表示各维同步偏高却未全体封顶——「高线旅队」式少见剖面，与典型十六型格点区分展示。',
  },
  HIDDEN_LOWCEILING: {
    icon: TrendingDown,
    accent: 'text-slate-600',
    badge: '少见 · 低云顶',
    trigger:
      '四维最高分仍 ≤ 约 2.15，但未落入更极端的「夜海同沉」区间。各维同步偏低却不至全盘触底，自陈上形成压低云顶式的少见形态，故单列说明。',
  },
};

export function getHiddenHeaderClass(code: HiddenStyleCode): string {
  const map: Record<HiddenStyleCode, string> = {
    HIDDEN_SUMMIT: 'from-amber-400 via-orange-500 to-rose-600',
    HIDDEN_ABYSS: 'from-slate-700 via-slate-800 to-zinc-950',
    HIDDEN_SPIRE: 'from-orange-500 via-amber-600 to-yellow-700',
    HIDDEN_DIAD: 'from-violet-600 via-purple-600 to-fuchsia-700',
    HIDDEN_TEMPEST: 'from-cyan-600 via-sky-600 to-blue-800',
    HIDDEN_PLATEAU: 'from-sky-400 via-cyan-500 to-teal-600',
    HIDDEN_HIGHFLOOR: 'from-emerald-500 via-teal-600 to-cyan-700',
    HIDDEN_LOWCEILING: 'from-slate-500 via-slate-600 to-slate-800',
  };
  return map[code];
}

function HiddenBarRow({
  label,
  value,
  hint,
  delay,
}: {
  label: string;
  hint: string;
  value: number;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const pct = (value / 5) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-800">{label}</span>
        <span className="tabular-nums text-slate-500">{value.toFixed(2)} / 5</span>
      </div>
      <p className="text-xs text-slate-500">{hint}</p>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-800"
          initial={reduce ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 0.85, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function DimSnapshot({ dims }: { dims: DimensionScores }) {
  const arr = [dims.s, dims.e, dims.t, dims.m];
  const minD = Math.min(...arr);
  const maxD = Math.max(...arr);
  const spread = maxD - minD;
  const mean = arr.reduce((a, b) => a + b, 0) / 4;
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-sm sm:grid-cols-4">
      <div>
        <p className="text-xs text-slate-500">最低维</p>
        <p className="font-mono font-semibold text-slate-900">{minD.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">最高维</p>
        <p className="font-mono font-semibold text-slate-900">{maxD.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">极差</p>
        <p className="font-mono font-semibold text-slate-900">{spread.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">均值</p>
        <p className="font-mono font-semibold text-slate-900">{mean.toFixed(2)}</p>
      </div>
    </div>
  );
}

const BORDER_ACCENT: Record<HiddenStyleCode, string> = {
  HIDDEN_SUMMIT: 'border-l-amber-500',
  HIDDEN_ABYSS: 'border-l-slate-700',
  HIDDEN_SPIRE: 'border-l-orange-500',
  HIDDEN_DIAD: 'border-l-violet-500',
  HIDDEN_TEMPEST: 'border-l-cyan-500',
  HIDDEN_PLATEAU: 'border-l-sky-400',
  HIDDEN_HIGHFLOOR: 'border-l-emerald-500',
  HIDDEN_LOWCEILING: 'border-l-slate-400',
};

export function HiddenResultBody({ code, dims }: { code: HiddenStyleCode; dims: DimensionScores }) {
  const meta = HIDDEN_WHY[code];
  const Icon = meta.icon;
  const analysis = getWittyEssay(code);
  const dimList = dimensionLabels();
  const border = BORDER_ACCENT[code];

  return (
    <div className="space-y-8">
      <DimSnapshot dims={dims} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={`border-slate-200 shadow-sm lg:border-l-4 ${border}`}>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2">
              <Icon className={`h-7 w-7 shrink-0 ${meta.accent}`} />
              <h3 className="text-lg font-bold text-slate-900">为何是隐藏款</h3>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.badge}</p>
            <p className="text-sm leading-relaxed text-slate-700">{meta.trigger}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <h3 className="text-lg font-bold text-slate-900">侧写分析</h3>
            <p className="text-sm leading-[1.85] text-slate-800">{analysis}</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">四维折算分</h3>
        <div className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
          {dimList.map((d, i) => (
            <Fragment key={d.key}>
              <HiddenBarRow
                label={d.title}
                hint={`偏高：${d.high} · 偏低：${d.low}`}
                value={dims[d.key]}
                delay={0.06 * i}
              />
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}

export function buildHiddenShareText(code: HiddenStyleCode, styleName: string): string {
  const w = HIDDEN_WHY[code];
  return [
    `【MUN 代表风格 · 隐藏款】`,
    `${styleName}（${code}）`,
    '',
    `【为何是隐藏款】${w.badge}`,
    w.trigger,
    '',
    '【侧写分析】',
    getWittyEssay(code),
    '',
  ].join('\n');
}
