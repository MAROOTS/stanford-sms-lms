import { useState } from 'react';
import { Sparkles, X, Users, GraduationCap, ClipboardList, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  { icon: Users, title: 'Add students', desc: 'Import or manually add your student roster.', to: '/students' },
  { icon: GraduationCap, title: 'Add teachers', desc: 'Register your teaching staff.', to: '/teachers' },
  { icon: ClipboardList, title: 'Create first term', desc: 'Set up academic terms and exams.', to: '/terms' },
];

export default function OnboardingCard() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('onboardingDismissed') === 'true'; } catch { return false; }
  });

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('onboardingDismissed', 'true'); } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-2xl p-6 mb-8 text-white relative overflow-hidden shadow-elevated animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent-500/10 rounded-full translate-y-1/2 pointer-events-none" />

      <button onClick={dismiss} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
        <X size={16} />
      </button>

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-accent-400" />
          <span className="text-sm font-semibold text-accent-400">Welcome to StanfordOS</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Let's get your school set up</h2>
        <p className="text-sm text-slate-300 mb-6 max-w-lg">
          Follow these quick steps to start managing your school efficiently.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                to={step.to}
                className="flex items-start gap-3 bg-white/10 hover:bg-white/15 rounded-xl p-4 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-1">
                    {idx + 1}. {step.title}
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">{step.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
