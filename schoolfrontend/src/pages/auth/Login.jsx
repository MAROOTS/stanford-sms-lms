import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotMsg, setShowForgotMsg] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, remember);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-16 py-10 bg-white relative">
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-primary-500 to-accent-400" />

        <div className="max-w-[380px] w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/25">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">StanfordOS</span>
              <p className="text-[11px] text-slate-400 leading-tight">School Management Platform</p>
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1.5">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Sign in to manage your school — attendance, exams, fees, and more, all in one place.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 border border-surface-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300 transition-all hover:bg-surface-50/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowForgotMsg(!showForgotMsg)}
                    className="text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-50 border border-surface-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300 transition-all hover:bg-surface-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {showForgotMsg && (
                  <div className="mt-2 text-xs text-slate-500 bg-surface-100 border border-surface-200 rounded-xl px-3.5 py-2.5 animate-fade-in">
                    Password resets aren't self-service yet — please contact your school administrator.
                  </div>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded-md border-surface-300 text-accent-500 focus:ring-accent-500/30 w-4 h-4"
              />
              <span>Remember me for 30 days</span>
            </label>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in flex items-center gap-2">
                <ShieldCheck size={16} className="text-red-400 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-800 to-primary-900 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-60 shadow-md shadow-primary-900/10 hover:shadow-lg hover:shadow-primary-900/15 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            New to StanfordOS?{" "}
            <span className="text-accent-600 font-semibold">
              Contact us to get started
            </span>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-auto pt-8">
          &copy; {new Date().getFullYear()} StanfordOS. All rights reserved.
        </p>
      </div>

      {/* Right panel — brand showcase */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 relative overflow-hidden flex-col justify-center px-16">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        {/* Gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-accent-400 bg-accent-400/10 border border-accent-400/20 rounded-full px-3.5 py-1.5 mb-10">
            <ShieldCheck size={14} />
            Trusted by schools worldwide
          </div>

          <h2 className="text-[42px] font-bold text-white leading-[1.15] mb-6 tracking-tight">
            Run your entire school from one calm, connected dashboard.
          </h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-md">
            Attendance, fees, examinations, and communication — unified for
            administrators, teachers, and parents alike.
          </p>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/8 transition-colors">
              <p className="text-3xl font-bold text-white">98.4%</p>
              <p className="text-xs text-slate-400 mt-1">
                Average attendance accuracy
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/8 transition-colors">
              <p className="text-3xl font-bold text-white">4.2 hrs</p>
              <p className="text-xs text-slate-400 mt-1">
                Admin time saved weekly
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/8 transition-colors">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">
                Data securely managed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-12 pt-8 border-t border-white/5">
            <div className="flex -space-x-2">
              {["S", "T", "A", "N"].map((letter) => (
                <div
                  key={letter}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 border-2 border-primary-900 flex items-center justify-center text-xs font-semibold text-white"
                  aria-hidden="true"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Joined by school administrators worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
