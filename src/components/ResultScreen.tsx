import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, CheckCircle2, Sparkles, Copy, RotateCcw, Download, Zap } from 'lucide-react';
import { styles, type DelegateStyle } from '../data';
import {
  computeResultCode,
  getDimensionScores,
  isHiddenStyleCode,
} from '../lib/munResult';
import { getHiddenHeaderClass } from './hidden/HiddenResultPages';
import { getResultMascotUrl } from '../lib/resultMascot';
import {
  StandardResultSections,
  type StandardCaptureRefs,
} from './StandardResultSections';
import { getWittyEssay } from '../data/wittyEssays';
import { downloadResultComposite } from '../lib/captureResultSections';
import { ResultDownloadComposite } from './ResultDownloadComposite';
import { COPY_LINK_URL } from '../lib/siteUrl';
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
  const [isCapturing, setIsCapturing]       = useState(false);
  const [toast, setToast] = useState<
    | null
    | { variant: 'success'; title: string; message: string }
    | { variant: 'error'; title: string; message: string }
  >(null);

  useEffect(() => {
    if (!toast || toast.variant !== 'success') return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);
  const downloadCompositeRef = useRef<HTMLDivElement>(null);
  const easterRef           = useRef<HTMLElement>(null);
  const promoRef            = useRef<HTMLDivElement>(null);

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

  const mascotSrc = useMemo(() => getResultMascotUrl(resultCode), [resultCode]);
  const wittyEssay  = useMemo(() => getWittyEssay(resultCode), [resultCode]);

  const captureFilePrefix = `春秋模联-${displayCode.replace(/[^\w\u4e00-\u9fff-]+/g, '_')}`;

  const downloadTestResultImage = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      await new Promise((r) => setTimeout(r, 320));
      await downloadResultComposite(captureFilePrefix, {
        compositeEl: downloadCompositeRef.current,
      });
    } catch (e) {
      console.error(e);
      setToast({
        variant: 'error',
        title: '生成失败',
        message: e instanceof Error ? e.message : '请稍后重试',
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const copySiteLink = async () => {
    try {
      await navigator.clipboard.writeText(COPY_LINK_URL);
      setToast({
        variant: 'success',
        title: '链接已复制',
        message: '网站链接已在剪贴板中，可直接粘贴到微信、QQ 等分享给好友。',
      });
    } catch {
      setToast({
        variant: 'error',
        title: '复制未成功',
        message: '请手动选中并复制浏览器地址栏中的链接。',
      });
    }
  };

  return (
    <div className="relative">
      {toast ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            aria-label="关闭"
            onClick={() => setToast(null)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-toast-title"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15"
          >
            <div className="p-6">
              <div className="flex gap-3.5">
                {toast.variant === 'success' ? (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertCircle className="h-6 w-6" strokeWidth={2} />
                  </div>
                )}
                <div className="min-w-0 pt-0.5">
                  <h3 id="result-toast-title" className="text-base font-semibold tracking-tight text-slate-900">
                    {toast.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{toast.message}</p>
                </div>
              </div>
              <Button
                type="button"
                className="mt-6 h-11 w-full rounded-xl bg-[#A64D52] text-white hover:bg-[#8f4448]"
                onClick={() => setToast(null)}
              >
                知道了
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
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

          {/* 结构参考性格卡片：顶栏标签 → 主标题 → 副标题 → 单张主视觉 → 代码 → 说明（配色仍为当前渐变头图） */}
          <div className="relative z-[2] mx-auto flex w-full max-w-lg flex-col items-center text-center">
            <motion.p
              className="mb-2 text-sm font-medium tracking-widest text-white/80"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              你更像
            </motion.p>

            <motion.h2
              className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              {style.name}
            </motion.h2>

            {style.nameEn ? (
              <motion.p
                className="mb-8 text-[13px] font-semibold tracking-[0.22em] text-white/85 sm:mb-10"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                SPECIAL · {style.nameEn}
              </motion.p>
            ) : (
              <div className="mb-8 sm:mb-10" aria-hidden />
            )}

            {mascotSrc ? (
              <motion.div
                className="relative mb-10 flex w-full flex-col items-center sm:mb-12"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
              >
                <img
                  src={mascotSrc}
                  alt=""
                  decoding="async"
                  className="pointer-events-none relative z-10 h-auto w-auto max-h-[11.5rem] max-w-[min(88vw,17rem)] object-contain object-bottom sm:max-h-[13.5rem] sm:max-w-[19rem] md:max-h-[15.5rem] md:max-w-[21rem]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none -mt-0.5 h-5 w-[min(74%,12rem)] rounded-[100%] bg-black/30 blur-md sm:h-5 sm:w-[min(70%,13.5rem)] md:w-[min(68%,15rem)]"
                  aria-hidden
                />
              </motion.div>
            ) : (
              <div className="mb-10 sm:mb-12" aria-hidden />
            )}

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mb-6 flex items-center justify-center gap-2"
            >
              <span className="h-px w-8 bg-white/40" />
              <span className="font-mono text-sm font-semibold tracking-[0.35em] text-white/90 uppercase">
                {displayCode}
              </span>
              <span className="h-px w-8 bg-white/40" />
            </motion.div>

            <motion.p
              className="max-w-xl text-base font-light leading-relaxed text-white/95 sm:text-lg"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {style.tagline}
            </motion.p>
          </div>

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

          <Separator />

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              再来一轮
            </Button>
            <Button size="lg" className="rounded-full px-8 shadow-md" onClick={() => void copySiteLink()}>
              <Copy className="mr-2 h-4 w-4" />
              复制链接
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8"
              disabled={isCapturing}
              onClick={() => void downloadTestResultImage()}
            >
              <Download className="mr-2 h-4 w-4" />
              {isCapturing ? '生成中…' : '下载测试结果'}
            </Button>
          </div>
        </CardContent>
      </motion.div>

      <ResultDownloadComposite
        ref={downloadCompositeRef}
        headerGradientClass={headerClass}
        displayCode={displayCode}
        styleName={style.name}
        nameEn={style.nameEn}
        mascotSrc={mascotSrc}
        essay={wittyEssay}
      />
    </div>
  );
}
