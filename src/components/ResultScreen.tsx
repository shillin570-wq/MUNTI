import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, Share2, RotateCcw, Camera, Zap } from 'lucide-react';
import { styles, type DelegateStyle } from '../data';
import { getWittyEssay } from '../data/wittyEssays';
import { TypeCatalog } from './TypeCatalog';
import {
  computeResultCode,
  getDimensionScores,
  isHiddenStyleCode,
} from '../lib/munResult';
import {
  HiddenResultBody,
  buildHiddenShareText,
  getHiddenHeaderClass,
} from './hidden/HiddenResultPages';
import {
  StandardResultSections,
  type StandardCaptureRefs,
} from './StandardResultSections';
import { downloadResultSectionPngs } from '../lib/captureResultSections';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
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
  battlefieldQuote: '"模联的意义，从来不只一个结果。"',
  tier: 'N',
};

export function ResultScreen({ answers, onReset }: Props) {
  const resultCode = useMemo(() => computeResultCode(answers), [answers]);
  const dims       = useMemo(() => getDimensionScores(answers), [answers]);
  const style      = styles[resultCode] ?? FALLBACK;
  const isHidden   = resultCode.startsWith('HIDDEN_');
  const isFullHidden = isHidden && isHiddenStyleCode(resultCode);
  const reduce     = useReducedMotion();

  const [revealed, setRevealed]             = useState(!isHidden);
  const [shareFeedback, setShareFeedback]   = useState<'idle' | 'shared' | 'copied'>('idle');
  const [showCatalog, setShowCatalog]       = useState(false);
  const [isCapturing, setIsCapturing]       = useState(false);

  const catalogRef    = useRef<HTMLElement | null>(null);
  const headerRef     = useRef<HTMLDivElement>(null);
  const easterRef     = useRef<HTMLElement>(null);
  const promoRef      = useRef<HTMLDivElement>(null);

  // 普通结果截图 refs
  const stdRefs: StandardCaptureRefs = {
    celebrities: useRef(null),
    essay:       useRef(null),
    dims:        useRef(null),
    letters:     useRef(null),
  };

  // 隐藏款截图 refs
  const hiddenRefs = {
    celebrities: useRef<HTMLElement>(null),
    essay:       useRef<HTMLElement>(null),
    dims:        useRef<HTMLElement>(null),
    letters:     useRef<HTMLElement>(null),
  };

  const headerClass = isFullHidden
    ? getHiddenHeaderClass(resultCode)
    : 'from-[#c47a7e] via-[#A64D52] to-[#7a3a3e]';

  const displayCode = isHidden
    ? (isFullHidden ? resultCode : 'HIDDEN')
    : resultCode;

  const wittyEssay = useMemo(() => getWittyEssay(resultCode), [resultCode]);

  useEffect(() => {
    if (!showCatalog) return;
    const id = window.requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [showCatalog]);

  const captureFilePrefix = `春秋模联-${displayCode.replace(/[^\w\u4e00-\u9fff-]+/g, '_')}`;

  const captureSectionScreenshots = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      await new Promise((r) => setTimeout(r, 320));
      const activeRefs = isFullHidden ? hiddenRefs : stdRefs;
      const slots: { el: HTMLElement | null | undefined; fileLabel: string }[] = [
        { el: headerRef.current,                   fileLabel: '属性头图' },
        { el: activeRefs.celebrities.current,      fileLabel: '代表人物' },
        { el: activeRefs.essay.current,            fileLabel: '类型描述' },
        { el: activeRefs.dims.current,             fileLabel: '维度侧写' },
        { el: activeRefs.letters.current,          fileLabel: '字母解释' },
        { el: isHidden && !isFullHidden ? easterRef.current : undefined, fileLabel: '彩蛋侧写' },
        { el: promoRef.current,                    fileLabel: '活动与联络' },
        ...(showCatalog ? [{ el: catalogRef.current, fileLabel: '完整图鉴' }] : []),
      ];
      await downloadResultSectionPngs(captureFilePrefix, slots);
    } finally {
      setIsCapturing(false);
    }
  };

  const buildShareBody = () =>
    isFullHidden
      ? buildHiddenShareText(resultCode, style.name)
      : [`【春秋模联·模联人格测试】`, `${style.name}（${displayCode}）`, '', wittyEssay, ''].join('\n');

  const shareOrForward = async () => {
    const text  = buildShareBody();
    const url   = window.location.href;
    const title = `春秋模联·模联人格测试 · ${style.name}（${displayCode}）`;
    const full  = `${text}\n\n在线测试：${url}`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: full });
        setShareFeedback('shared');
        setShowCatalog(true);
        window.setTimeout(() => setShareFeedback('idle'), 2200);
        return;
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(full);
      setShareFeedback('copied');
      setShowCatalog(true);
      window.setTimeout(() => setShareFeedback('idle'), 2200);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      {/* 顶部装饰光晕 */}
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
        {/* ══ #1 属性 · 渐变头图 ══ */}
        <div
          ref={headerRef}
          className={`relative bg-gradient-to-br ${headerClass} px-6 py-12 text-center text-white sm:px-10 sm:py-14`}
        >
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
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="relative mx-auto mb-6 flex items-center justify-center gap-2"
          >
            <span className="h-px w-8 bg-white/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
              春秋模联 · MUNTI
            </span>
            <span className="h-px w-8 bg-white/40" />
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

          {style.nameEn ? (
            <motion.p
              className="relative -mt-1 mb-4 text-center text-[13px] font-semibold tracking-[0.22em] text-white/85"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              SPECIAL · {style.nameEn}
            </motion.p>
          ) : null}

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="relative mx-auto mb-5 flex items-center justify-center gap-2"
          >
            <span className="h-px w-8 bg-white/40" />
            <span className="font-mono text-sm font-semibold tracking-[0.35em] text-white/90 uppercase">
              {displayCode}
            </span>
            <span className="h-px w-8 bg-white/40" />
          </motion.div>

          <motion.p
            className="relative mx-auto max-w-xl text-base font-light leading-relaxed text-white/95 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {style.tagline}
          </motion.p>

          {isHidden && !isFullHidden && (
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

        {/* ══ 正文区 ══ */}
        <CardContent className="space-y-10 p-6 sm:p-10">

          {/* 隐藏款和普通款共用同一套五板块布局 */}
          <StandardResultSections
            resultCode={resultCode}
            dims={dims}
            captureRefs={isFullHidden ? hiddenRefs : stdRefs}
          />

          {/* 普通「隐藏款」彩蛋提示（触发了 HIDDEN 前缀但未命中任一具名隐藏码） */}
          {isHidden && !isFullHidden && (
            <section ref={easterRef} className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">彩蛋侧写</h3>
              <p className="mx-auto mt-2 max-w-lg text-slate-600">这组印象凑在一起比较少见，所以用隐藏款来称呼你。</p>
            </section>
          )}

          <Separator />

          {/* 宣传区 + 全图鉴提示 */}
          <div ref={promoRef} className="space-y-5">
            <p className="rounded-2xl border border-[#A64D52]/25 bg-[#A64D52]/[0.07] px-4 py-3 text-center text-sm font-semibold leading-snug text-[#A64D52] sm:text-base">
              下滑转发解锁全图鉴16人格以及8个隐藏人格
            </p>
            <section className="space-y-4" aria-label="春秋模联 SAMUN">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                春秋模联 · SAMUN
              </p>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                  <img
                    src="/samun-summer-poster.png"
                    alt="春秋模拟联合国系列会议 · 夏季峰会"
                    className="w-full object-contain"
                    decoding="async"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                  <img
                    src="/samun-contact.png"
                    alt="联系我们"
                    className="w-full object-contain"
                    decoding="async"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* 转发后展示完整图鉴 */}
          {showCatalog && (
            <motion.section
              ref={catalogRef}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 rounded-[1.75rem] border border-[#A64D52]/20 bg-gradient-to-b from-white to-[#A64D52]/[0.04] px-5 py-8 sm:px-8 sm:py-10"
              aria-label="全图鉴"
            >
              <p className="text-center text-sm font-medium text-[#A64D52]">转发成功 · 以下为完整人格图鉴（16 + 8）</p>
              <TypeCatalog />
            </motion.section>
          )}

          <Separator />

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              再来一轮
            </Button>
            <Button size="lg" className="rounded-full px-8 shadow-md" onClick={shareOrForward}>
              <Share2 className="mr-2 h-4 w-4" />
              {shareFeedback === 'shared' ? '已分享' : shareFeedback === 'copied' ? '已复制' : '转发分享'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8"
              disabled={isCapturing}
              onClick={() => void captureSectionScreenshots()}
            >
              <Camera className="mr-2 h-4 w-4" />
              {isCapturing ? '导出中…' : '一键截图'}
            </Button>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}
