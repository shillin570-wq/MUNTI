/**
 * 标准结果五板块（代表人物 / 类型描述 / 维度侧写 / 字母解释）
 * 普通人格和隐藏款共用同一套布局。
 */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { User } from 'lucide-react';
import {
  getCelebrityImagePath,
  getCelebritySignaturePath,
  getCelebrities,
  getWittyEssay,
} from '../data/wittyEssays';
import {
  dimensionLabels,
  RESULT_LETTER_EN,
  type DimensionScores,
} from '../lib/munResult';

// ─────────────────────────── 内部常量 ────────────────────────────────

const DIM_LETTERS: Record<keyof DimensionScores, { highCode: string; lowCode: string }> = {
  s: { highCode: 'C', lowCode: 'A' },
  e: { highCode: 'E', lowCode: 'I' },
  t: { highCode: 'S', lowCode: 'N' },
  m: { highCode: 'P', lowCode: 'B' },
};

const LETTER_PAIRS: { dim: string; high: string; low: string }[] = [
  { dim: '策略', high: 'C', low: 'A' },
  { dim: '表达', high: 'E', low: 'I' },
  { dim: '文本', high: 'S', low: 'N' },
  { dim: '游说', high: 'P', low: 'B' },
];

function visualPosPctFromScore(value: number, stretch = 2): number {
  const raw = (value - 1) / 4;
  let n = 0.5 + (raw - 0.5) * stretch;
  n = Math.max(0, Math.min(1, n));
  return n * 100;
}

// ─────────────────────────── CelebritySignature ──────────────────────

function CelebritySignature({ code }: { code: string }) {
  const [ok, setOk] = useState(true);
  const src = getCelebritySignaturePath(code);
  useEffect(() => { setOk(true); }, [src]);

  return ok ? (
    <div className="flex justify-center px-4">
      <img
        src={src}
        alt="人物签名"
        className="max-h-24 w-auto max-w-xs object-contain"
        decoding="async"
        onError={() => setOk(false)}
      />
    </div>
  ) : (
    <div className="mx-auto flex h-20 w-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200">
      <span className="text-xs text-slate-400">人物签名（敬请期待）</span>
    </div>
  );
}

// ─────────────────────────── BipolarBar ──────────────────────────────

export function BipolarBar({
  d,
  value,
  delay,
}: {
  d: { key: keyof DimensionScores; title: string; high: string; low: string };
  value: number;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const letters = DIM_LETTERS[d.key];
  const posPct = visualPosPctFromScore(value);
  const deviationPct = Math.abs(posPct - 50);
  const goesRight = value > 3;
  const goesLeft = value < 3;

  const highGloss = RESULT_LETTER_EN[letters.highCode];
  const lowGloss  = RESULT_LETTER_EN[letters.lowCode];

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${goesLeft ? 'opacity-100' : 'opacity-25'}`}>
          <span className="font-mono text-base font-bold text-slate-500">{letters.lowCode}</span>
          <span className="text-xs font-semibold text-slate-600">{lowGloss?.word}</span>
          <span className="hidden text-[11px] text-slate-400 sm:inline">· {d.low}</span>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-400">{value.toFixed(2)}</span>
        <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${goesRight ? 'opacity-100' : 'opacity-25'}`}>
          <span className="hidden text-[11px] text-slate-400 sm:inline">{d.high} ·</span>
          <span className="text-xs font-semibold text-slate-600">{highGloss?.word}</span>
          <span className="font-mono text-base font-bold text-[#A64D52]">{letters.highCode}</span>
        </div>
      </div>

      <div className="relative h-5">
        <div className="absolute inset-0 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-px bg-slate-300/60" />
          {goesRight && (
            <motion.div
              className="absolute top-0 h-full origin-left bg-gradient-to-r from-[#A64D52]/50 to-[#A64D52]"
              style={{ left: '50%', width: `${deviationPct}%` }}
              initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          {goesLeft && (
            <motion.div
              className="absolute top-0 h-full origin-right bg-gradient-to-l from-[#A64D52]/50 to-[#A64D52]"
              style={{ right: '50%', width: `${deviationPct}%` }}
              initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </div>
        <motion.div
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#A64D52] shadow-md"
          initial={reduce ? { left: `${posPct}%` } : { left: '50%' }}
          animate={{ left: `${posPct}%` }}
          transition={{ duration: reduce ? 0 : 0.85, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="sm:hidden">{d.low}</span>
        <span className="mx-auto">{d.title}</span>
        <span className="sm:hidden">{d.high}</span>
      </div>
    </div>
  );
}

// ─────────────────────────── capture refs 类型 ───────────────────────

export type StandardCaptureRefs = {
  celebrities: RefObject<HTMLElement | null>;
  essay: RefObject<HTMLElement | null>;
  dims: RefObject<HTMLElement | null>;
  letters: RefObject<HTMLElement | null>;
};

export function useStandardCaptureRefs(): StandardCaptureRefs {
  return {
    celebrities: useRef<HTMLElement>(null),
    essay:       useRef<HTMLElement>(null),
    dims:        useRef<HTMLElement>(null),
    letters:     useRef<HTMLElement>(null),
  };
}

// ─────────────────────────── 五个公共板块 ────────────────────────────

export function StandardResultSections({
  resultCode,
  dims,
  captureRefs,
}: {
  resultCode: string;
  dims: DimensionScores;
  captureRefs?: StandardCaptureRefs;
}) {
  const wittyEssay  = getWittyEssay(resultCode);
  const celebrities = getCelebrities(resultCode);
  const imgSrc      = getCelebrityImagePath(resultCode);
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => { setImgOk(true); }, [imgSrc]);

  const dimList = dimensionLabels();

  return (
    <>
      {/* ── 代表人物 ── */}
      <section ref={captureRefs?.celebrities} className="space-y-3">
        <h3 className="text-xl font-bold text-slate-900">代表人物</h3>
        <div className="space-y-4">
          <div className="relative flex min-h-[13rem] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 px-1 py-2 sm:min-h-[16rem]">
            {imgOk ? (
              <img
                src={imgSrc}
                alt=""
                className="mx-auto block h-auto max-h-[min(70vh,32rem)] w-full object-contain"
                decoding="async"
                onError={() => setImgOk(false)}
              />
            ) : (
              <div className="flex min-h-[13rem] w-full items-center justify-center sm:min-h-[16rem]">
                <User className="h-16 w-16 text-slate-400" />
              </div>
            )}
          </div>
          {celebrities ? (
            <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3 sm:gap-3">
              {celebrities.split(' / ').map((name) => (
                <p key={name} className="text-sm font-medium text-slate-700">{name}</p>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm font-medium text-slate-400">敬请期待</p>
          )}
          <CelebritySignature code={resultCode} />
        </div>
      </section>

      {/* ── 类型描述 ── */}
      <section ref={captureRefs?.essay} className="space-y-3">
        <h3 className="text-xl font-bold text-slate-900">类型描述</h3>
        <div className="rounded-2xl border border-[#A64D52]/15 bg-gradient-to-br from-slate-50 to-[#A64D52]/[0.05] p-6 sm:p-8">
          <p className="whitespace-pre-wrap text-base leading-[1.9] text-slate-800">{wittyEssay}</p>
        </div>
      </section>

      {/* ── 维度侧写 ── */}
      <section ref={captureRefs?.dims} className="space-y-3">
        <h3 className="text-xl font-bold text-slate-900">维度侧写</h3>
        <div className="space-y-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
          {dimList.map((d, i) => (
            <div key={d.key}>
              <BipolarBar d={d} value={dims[d.key]} delay={0.08 * i} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 字母解释 ── */}
      <section ref={captureRefs?.letters} className="space-y-3">
        <h3 className="text-xl font-bold text-slate-900">字母解释</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LETTER_PAIRS.map(({ dim, high, low }) => {
            const highGloss  = RESULT_LETTER_EN[high] ?? { word: '', phraseZh: '' };
            const lowGloss   = RESULT_LETTER_EN[low]  ?? { word: '', phraseZh: '' };
            const isHiddenCode = resultCode.startsWith('HIDDEN_');
            const activeHigh = !isHiddenCode && resultCode.includes(high);
            const activeLow  = !isHiddenCode && resultCode.includes(low);
            return (
              <div key={dim} className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <div className="bg-slate-50 px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{dim}</span>
                </div>
                <div className={`flex items-start gap-3 px-4 py-3 transition-colors ${activeHigh ? 'bg-[#A64D52]/[0.06]' : ''}`}>
                  <span className={`font-mono text-2xl font-bold leading-none ${activeHigh ? 'text-[#A64D52]' : 'text-slate-300'}`}>{high}</span>
                  <div>
                    <p className={`text-sm font-semibold ${activeHigh ? 'text-slate-800' : 'text-slate-500'}`}>{highGloss.word}</p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-500">{highGloss.phraseZh}</p>
                  </div>
                </div>
                <div className={`flex items-start gap-3 px-4 py-3 transition-colors ${activeLow ? 'bg-[#A64D52]/[0.06]' : ''}`}>
                  <span className={`font-mono text-2xl font-bold leading-none ${activeLow ? 'text-[#A64D52]' : 'text-slate-300'}`}>{low}</span>
                  <div>
                    <p className={`text-sm font-semibold ${activeLow ? 'text-slate-800' : 'text-slate-500'}`}>{lowGloss.word}</p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-500">{lowGloss.phraseZh}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
