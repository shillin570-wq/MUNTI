import { styles } from '../data';
import { HIDDEN_STYLE_CODES } from '../lib/munResult';

/** 十六型展示顺序（与对外命名一致） */
const STANDARD_CODES = [
  'CESP',
  'CESB',
  'CISP',
  'CISB',
  'CENP',
  'CENB',
  'CINP',
  'CINB',
  'AESP',
  'AESB',
  'AISP',
  'AISB',
  'AENP',
  'AENB',
  'AINP',
  'AINB',
] as const;

type Props = {
  className?: string;
};

export function TypeCatalog({ className = '' }: Props) {
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A64D52]">MUNTI</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">全图鉴 · 16 人格</h2>
        <p className="mt-2 text-sm text-slate-600">四字母码与中文称谓一览（测完可对照你的结果）</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {STANDARD_CODES.map((code) => {
          const s = styles[code];
          return (
            <div
              key={code}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-left"
            >
              <span className="font-mono text-sm font-bold tracking-wide text-[#A64D52]">{code}</span>
              <span className="min-w-0 flex-1 text-right text-sm font-medium text-slate-800">{s?.name ?? '—'}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 pt-8">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">SPECIAL · 8 隐藏人格</h3>
          <p className="mt-2 text-sm text-slate-600">稀有剖面，由四维折算分触发（详见结果页「为何是隐藏款」）</p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {HIDDEN_STYLE_CODES.map((code) => {
            const s = styles[code];
            const en = s?.nameEn;
            const zh = s?.name;
            return (
              <div
                key={code}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-[#A64D52]/[0.06] px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-slate-800">
                    {en ? `SPECIAL · ${en}` : zh ? `SPECIAL·${zh}` : code}
                  </span>
                  {en && zh ? (
                    <span className="mt-0.5 block text-xs text-slate-500 sm:mt-0 sm:ml-2 sm:inline">
                      {zh}
                    </span>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-[11px] font-medium tabular-nums text-slate-400">{code}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
