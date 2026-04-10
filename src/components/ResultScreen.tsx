import { Fragment, useMemo, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Sparkles, Share2, RotateCcw, Printer, Quote, Zap } from 'lucide-react';
import { styles, type DelegateStyle } from '../data';
import { getWittyEssay } from '../data/wittyEssays';
import {
  computeResultCode,
  dimensionLabels,
  getDimensionScores,
  isHiddenStyleCode,
  RESULT_LETTER_EN,
} from '../lib/munResult';
import { HiddenResultBody, buildHiddenShareText, getHiddenHeaderClass } from './hidden/HiddenResultPages';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type Props = {
  answers: Record<number, number>;
  onReset: () => void;
};

const FALLBACK: DelegateStyle = {
  name: '未知代表',
  tagline: '系统未能识别你的风格，但你依然独一无二。',
  description: '',
  funAnalysis: '',
  arc: '',
  strengths: ['保持好奇', '继续探索', '享受会议'],
  watchOut: '结果异常时，建议重新测评或检查填写是否完整。',
  battlefieldQuote: '“模联的意义，从来不只一个结果。”',
  tier: 'N',
};

function BarRow({
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
          className="h-full rounded-full bg-gradient-to-r from-[#A64D52] to-[#c47a7e]"
          initial={reduce ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 0.85, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function ResultScreen({ answers, onReset }: Props) {
  const resultCode = useMemo(() => computeResultCode(answers), [answers]);
  const dims = useMemo(() => getDimensionScores(answers), [answers]);
  const style = styles[resultCode] ?? FALLBACK;
  const isHidden = resultCode.startsWith('HIDDEN_');
  const reduce = useReducedMotion();

  const [revealed, setRevealed] = useState(!isHidden);
  const [copied, setCopied] = useState(false);

  const wittyEssay = useMemo(() => getWittyEssay(resultCode), [resultCode]);

  const headerClass =
    isHidden && isHiddenStyleCode(resultCode)
      ? getHiddenHeaderClass(resultCode)
      : isHidden
        ? 'from-[#c47a7e] via-[#A64D52] to-[#7a3a3e]'
        : 'from-[#c47a7e] via-[#A64D52] to-[#7a3a3e]';

  const displayCode = isHidden ? (isHiddenStyleCode(resultCode) ? resultCode : 'HIDDEN') : resultCode;
  const copyShare = async () => {
    const text =
      isHidden && isHiddenStyleCode(resultCode)
        ? buildHiddenShareText(resultCode, style.name)
        : [
            `【MUN 代表风格 · 简单描述】`,
            `${style.name}（${displayCode}）`,
            '',
            wittyEssay,
            '',
          ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  };

  const dimList = dimensionLabels();

  return (
    <div className="relative">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-1/2 h-72 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.14),transparent_55%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40"
      >
        <div className={`relative bg-gradient-to-br ${headerClass} px-6 py-12 text-center text-white sm:px-10 sm:py-14`}>
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 30%, white 0, transparent 30%)',
            }}
            animate={reduce ? undefined : { opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <img
            src="/result-logo.png"
            alt="春秋模联"
            className="pointer-events-none absolute left-4 top-7 z-[2] h-16 w-auto object-contain mix-blend-screen opacity-[0.98] sm:left-5 sm:top-9 sm:h-20"
            decoding="async"
          />

          <motion.div
            initial={reduce ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 22 }}
            className="relative mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="tracking-wide">春秋模联·MUNTI</span>
          </motion.div>

          <motion.p
            className="relative mb-3 text-sm font-medium tracking-widest text-white/80"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            你更像
          </motion.p>

          <motion.h2
            className="relative mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            {style.name}
          </motion.h2>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.24, type: 'spring', stiffness: 200, damping: 18 }}
            className="relative mx-auto mb-5 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/15 px-5 py-2 font-mono text-base tracking-[0.35em] backdrop-blur-md sm:text-lg"
          >
            {displayCode}
          </motion.div>

          <motion.p
            className="relative mx-auto max-w-xl text-base font-light leading-relaxed text-white/95 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {style.tagline}
          </motion.p>

          {isHidden && !isHiddenStyleCode(resultCode) && (
            <motion.button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <Zap className="h-4 w-4" />
              {revealed ? '收起侧写条' : '看看四维侧写'}
            </motion.button>
          )}
        </div>

        <CardContent className="space-y-10 p-6 sm:p-10">
          {isHidden && isHiddenStyleCode(resultCode) ? (
            <HiddenResultBody code={resultCode} dims={dims} />
          ) : (
            <>
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">简单描述</h3>
                <Card className="border-[#A64D52]/20 bg-gradient-to-br from-slate-50 to-[#A64D52]/[0.06] shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex gap-3">
                      <Quote className="mt-1 h-6 w-6 shrink-0 text-[#A64D52]" />
                      <p className="whitespace-pre-wrap text-base leading-[1.9] text-slate-800">{wittyEssay}</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">风格侧写</h3>
                  {!isHidden && <span className="text-xs font-medium text-slate-500">由印象折算（1–5）</span>}
                </div>

                <AnimatePresence mode="wait">
                  {(!isHidden || revealed) && (
                    <motion.div
                      key="bars"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-6"
                    >
                      {dimList.map((d, i) => (
                        <Fragment key={d.key}>
                          <BarRow
                            label={d.title}
                            hint={`偏高：${d.high} · 偏低：${d.low}`}
                            value={dims[d.key]}
                            delay={0.08 * i}
                          />
                        </Fragment>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isHidden && !revealed && (
                  <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
                    隐藏款可先读上文简单描述；需要对照数据时，点上方按钮展开四维条。
                  </p>
                )}
              </section>
            </>
          )}

          {!isHidden && (
            <section>
              <h3 className="mb-4 text-xl font-bold text-slate-900">字母含义</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(['策略', '表达', '文本', '游说'] as const).map((dimLabel, idx) => {
                  const ch = resultCode[idx];
                  const gloss = RESULT_LETTER_EN[ch] ?? { word: '', phraseZh: '' };
                  return (
                    <motion.div
                      key={dimLabel}
                      whileHover={reduce ? undefined : { y: -2 }}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="mb-2 flex items-end justify-between gap-2">
                        <span className="font-semibold text-slate-800">{dimLabel}</span>
                        <span className="font-mono text-2xl font-bold text-[#A64D52]">{ch}</span>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{gloss.word}</p>
                      <p className="mt-1 text-sm text-slate-600">{gloss.phraseZh}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {isHidden && !isHiddenStyleCode(resultCode) && (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">彩蛋侧写</h3>
              <p className="mx-auto mt-2 max-w-lg text-slate-600">这组印象凑在一起比较少见，所以用隐藏款来称呼你。</p>
            </section>
          )}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              再来一轮
            </Button>
            <Button size="lg" className="rounded-full px-8 shadow-md" onClick={copyShare}>
              <Share2 className="mr-2 h-4 w-4" />
              {copied ? '已复制' : '复制分享'}
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-8" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              打印
            </Button>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}
