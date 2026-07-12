import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Landmark, ShieldCheck, Loader2 } from "lucide-react";
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
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 sm:px-16 py-10 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center">
            <Landmark size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">StanfordOS</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Sign in to continue to your school's dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowForgotMsg(!showForgotMsg)}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {showForgotMsg && (
                  <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-2 animate-fade-in">
                    Password resets aren't self-service yet — please contact your school administrator.
                  </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-accent"
              />
              Remember me for 30 days
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to StanfordOS?{" "}
            <span className="text-teal-600 font-medium">
              Contact us to get started
            </span>
          </p>
        </div>

        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} StanfordOS. All rights reserved.
        </p>
      </div>

      {/* Right panel — brand/stats */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-950 relative overflow-hidden flex-col justify-between px-14 py-10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 w-fit">
            <ShieldCheck size={14} className="text-teal-accent" />
            Trusted by schools worldwide
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Run your entire school from one calm, connected dashboard.
          </h2>
          <p className="text-slate-300 mb-8 max-w-md">
            Attendance, fees, examinations, and communication — unified for
            administrators, teachers, and parents alike.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/10 transition-colors">
              <p className="text-2xl font-bold text-white">98.4%</p>
              <p className="text-xs text-slate-400 mt-1">
                Average attendance accuracy
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/10 transition-colors">
              <p className="text-2xl font-bold text-white">4.2 hrs</p>
              <p className="text-xs text-slate-400 mt-1">
                Admin time saved weekly
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">
            {["E", "K", "M", "R"].map((letter) => (
              <div
                key={letter}
                className="w-8 h-8 rounded-full bg-teal-accent border-2 border-navy-950 flex items-center justify-center text-xs font-semibold text-white"
                aria-hidden="true"
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            Joined this month by school administrators like you
          </p>
        </div>
      </div>
    </div>
  );
}
