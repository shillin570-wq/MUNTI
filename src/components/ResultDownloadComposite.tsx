import { forwardRef, type CSSProperties } from 'react';

type Props = {
  /** 与 `ResultScreen` 头图相同的 Tailwind 渐变片段，如 `from-sky-400 via-cyan-500 to-teal-600` */
  headerGradientClass: string;
  displayCode: string;
  styleName: string;
  nameEn?: string;
  mascotSrc: string | null;
  essay: string;
};

/** 叠在头图渐变上的浅色方格（与线上头图光感一致，线用半透明白） */
const GRID_OVERLAY_STYLE: CSSProperties = {
  backgroundImage: `
    linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
  `,
  backgroundSize: '18px 18px',
};

/**
 * 仅用于「下载测试结果」截图：背景与结果页头图同一套渐变 + 方格叠层；无双封面。
 */
export const ResultDownloadComposite = forwardRef<HTMLDivElement, Props>(
  function ResultDownloadComposite(
    { headerGradientClass, displayCode, styleName, nameEn, mascotSrc, essay },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className="fixed top-0 left-0 overflow-hidden shadow-none"
        style={{
          width: 720,
          transform: 'translateX(-120vw)',
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${headerGradientClass}`}
          aria-hidden
        />
        <div className="absolute inset-0 pointer-events-none opacity-[0.55]" style={GRID_OVERLAY_STYLE} aria-hidden />
        {/* 与头图类似的漫射高光 */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 30%, white 0, transparent 30%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 text-white">
          <div className="px-8 pb-5 pt-7">
            <div className="flex flex-row items-center gap-6">
              <div className="min-w-0 flex-1 text-left">
                <p
                  className="mb-1 text-[2rem] font-black leading-none tracking-tight text-amber-200"
                  style={{
                    WebkitTextStroke: '1px rgba(255, 250, 235, 0.35)',
                  }}
                >
                  MUNTI
                </p>
                <p className="mb-2 text-sm font-semibold text-white/85">您的测试类型</p>
                <p className="break-all text-[2.5rem] font-black leading-none tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.15)]">
                  {displayCode}
                </p>
                <p className="mt-2 text-xl font-bold text-white">{styleName}</p>
                {nameEn ? (
                  <p className="mt-1 text-[13px] font-semibold tracking-[0.18em] text-white/90">
                    SPECIAL · {nameEn}
                  </p>
                ) : null}
              </div>

              <div className="relative flex w-[188px] shrink-0 flex-col items-center">
                <span
                  className="mb-1 self-end font-serif text-4xl font-bold leading-none text-orange-100/90"
                  aria-hidden
                >
                  &ldquo;
                </span>
                <div className="relative flex h-[148px] w-full items-end justify-center">
                  {mascotSrc ? (
                    <>
                      <div
                        className="pointer-events-none absolute inset-x-2 bottom-5 top-3 rounded-full bg-gradient-to-t from-white/35 to-transparent blur-2xl"
                        aria-hidden
                      />
                      <img
                        src={mascotSrc}
                        alt=""
                        className="relative z-10 max-h-[138px] w-auto max-w-[170px] object-contain object-bottom drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                      />
                    </>
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-white/45 bg-white/15 text-xs text-white/75">
                      小人插画
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 pt-2">
            <h3 className="mb-3 text-left text-base font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
              类型描述
            </h3>
            <p className="text-left text-[13px] leading-[1.85] text-white/92 whitespace-pre-wrap [text-shadow:0_1px_2px_rgba(0,0,0,0.18)]">
              {essay}
            </p>
          </div>
        </div>
      </div>
    );
  },
);
