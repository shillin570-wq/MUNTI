import { useState, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { questions } from './data';
import { ResultScreen } from './components/ResultScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

/** 1–5 分：明确量表表述（与封面说明一致） */
const SCORE_OPTION_LABELS: Record<number, string> = {
  1: '完全不符合',
  2: '较不符合',
  3: '中立',
  4: '较符合',
  5: '非常符合',
};

export default function App() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isTestComplete = Object.keys(answers).length === questions.length;

  const handleFinish = () => {
    if (isTestComplete) {
      setStep('result');
    }
  };

  const resetTest = () => {
    setAnswers({});
    setStep('intro');
  };

  /** 答题页滚到底部后切到结果页时，保留滚动位置会落在结果页「中部」；每步切换都回到顶部 */
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <div
      className={
        step === 'intro' || step === 'result'
          ? 'min-h-screen bg-white text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-950'
          : 'min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-950'
      }
    >
      <div
        className={`mx-auto p-4 sm:p-6 lg:p-8 ${step === 'result' ? 'max-w-4xl' : step === 'intro' ? 'max-w-lg' : 'max-w-3xl'}`}
      >
        {step === 'intro' && (
          <div className="relative -mx-4 flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center rounded-3xl bg-white px-2 py-10 sm:-mx-6 sm:px-4 sm:py-14 lg:-mx-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md"
            >
              <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white ring-0">
                <CardHeader className="relative space-y-0 pb-2 pt-10 text-center sm:pt-12">
                  <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#a64d52]">春秋模联·模联人格测试</p>

                  <div className="relative mx-auto mb-8 h-36 w-36 sm:h-40 sm:w-40">
                    <div className="absolute inset-0 -rotate-[8deg] rounded-2xl border border-rose-100 bg-rose-50/50" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
                      <motion.img
                        src="/logo.png"
                        alt="品牌标识"
                        className="max-h-full max-w-full object-contain"
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.12, duration: 0.45, type: 'spring', stiffness: 260, damping: 20 }}
                      />
                    </div>
                  </div>

                  <CardTitle className="px-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem] sm:leading-tight">
                    代表风格侧写
                  </CardTitle>
                  <CardDescription className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-600">
                    共四十道情境题，请根据您在模联会议中的真实经历与习惯作答。得分仅用于生成风格侧写结果，无对错之分。
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-5 px-6 pb-2 pt-2 sm:px-10">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                    <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a64d52]" />
                      <h3 className="text-sm font-semibold tracking-wide text-rose-900">作答说明</h3>
                    </div>
                    <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
                      每题请从 1 至 5 分中选择最贴近您实际情况的一项。题目围绕议事规则、发言协作与会场常见情境，请尽量诚实作答，以便结果更准确。
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">1 完全不符合</span>
                    <span className="text-slate-400">→</span>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-800">5 非常符合</span>
                    <span className="w-full text-[11px] text-slate-400 sm:w-auto">· 2～4：较不符合、中立、较符合</span>
                  </div>
                </CardContent>

                <CardFooter className="relative flex flex-col items-center gap-3 border-0 bg-transparent px-6 pb-10 pt-2 sm:px-10">
                  <Button
                    size="lg"
                    onClick={() => setStep('test')}
                    className="h-auto w-full max-w-xs rounded-full border border-[#a64d52] bg-[#a64d52] py-4 text-base font-semibold text-white transition hover:bg-[#954a4f] active:scale-[0.98] sm:text-lg"
                  >
                    开始作答
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}

        {step === 'test' && (
          <div className="space-y-6 pb-24">
            <div className="sticky top-0 z-10 border-b border-slate-200/50 bg-slate-50/80 pb-6 pt-4 backdrop-blur-md">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src="/munti-mark.png"
                  alt="春秋模联"
                  className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
                  decoding="async"
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">春秋模联·模联人格测试</h2>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-slate-500">
                      {Object.keys(answers).length} / {questions.length}
                    </span>
                  </div>
                  <Progress
                    value={(Object.keys(answers).length / questions.length) * 100}
                    className="h-2 [&_[data-slot=progress-indicator]]:bg-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 mt-8">
              {questions.map((q, index) => {
                const selected = answers[q.id];
                return (
                <Card
                  key={q.id}
                  className={`border shadow-sm transition-all duration-300 ${
                    selected != null
                      ? 'border-emerald-300/70 bg-emerald-50/40 ring-1 ring-emerald-200/60 hover:ring-emerald-300/80'
                      : 'border-transparent opacity-100'
                  }`}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex gap-4">
                      <div className="flex flex-shrink-0 flex-col items-start gap-1 pt-1">
                        <span className="text-xs font-medium tabular-nums text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="min-w-0 flex-grow space-y-6">
                        <p className="text-lg font-medium text-slate-800 leading-relaxed">{q.text}</p>
                        {selected != null ? (
                          <p className="rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-sm text-emerald-950">
                            <span className="font-medium text-emerald-800">您的选择：</span>
                            {selected} 分 — {SCORE_OPTION_LABELS[selected]}
                          </p>
                        ) : null}
                        <RadioGroup
                          value={answers[q.id]?.toString()}
                          onValueChange={(val) => handleAnswer(q.id, parseInt(val))}
                          className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4"
                        >
                          {[1, 2, 3, 4, 5].map((val) => (
                            <div key={val} className="flex-1">
                              <RadioGroupItem value={val.toString()} id={`q${q.id}-${val}`} className="peer sr-only" />
                              <Label
                                htmlFor={`q${q.id}-${val}`}
                                className="relative flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/40 peer-data-[state=checked]:scale-[1.02] peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-600 peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-emerald-600/25 sm:p-4"
                              >
                                <div className="absolute right-2 top-2 opacity-0 transition-opacity peer-data-[state=checked]:opacity-100">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                                <span className="mb-1 text-lg font-bold">{val}</span>
                                <span className="text-center text-[11px] font-medium leading-snug opacity-90 peer-data-[state=checked]:text-emerald-50 sm:text-xs">
                                  {SCORE_OPTION_LABELS[val]}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <p className="text-sm text-slate-500 font-medium">
                  {isTestComplete ? '可以啦' : `还剩 ${questions.length - Object.keys(answers).length} 段`}
                </p>
                <Button size="lg" onClick={handleFinish} disabled={!isTestComplete} className="rounded-full bg-emerald-600 px-8 shadow-md hover:bg-emerald-700">
                  生成侧写
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && <ResultScreen answers={answers} onReset={resetTest} />}
      </div>
    </div>
  );
}
