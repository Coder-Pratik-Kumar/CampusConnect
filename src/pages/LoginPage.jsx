import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, RotateCw } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please enter both email address and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 p-4 sm:p-6 my-auto">
      {/* Left Column: Brand Intro */}
      <div className="md:w-1/2 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-soft">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-heading font-extrabold text-3xl tracking-tight text-brand-text">
            CampusConnect
          </span>
        </div>

        {/* Headline & Body */}
        <div className="space-y-3">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-brand-text leading-tight">
            Turn your skills into connections.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md font-normal">
            Join the premier academic network designed to bridge the gap between your expertise and your peers. Share knowledge, collaborate on projects, and build a portfolio that speaks for itself.
          </p>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="md:w-1/2 w-full flex justify-center md:justify-end">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100/70 shadow-soft-xl relative overflow-hidden">
          {/* Subtle top-right accent blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100/70 to-teal-50/50 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-brand-text">
                Sign in to your account
              </h2>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-700 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="student@university.edu"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </span>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent!'); }} className="text-xs font-bold text-brand-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightIcon={showPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 h-4 w-4 accent-brand-primary"
                />
                <label htmlFor="remember" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                icon={isSubmitting ? RotateCw : ArrowRight}
                iconPosition="right"
                className={`py-2.5 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => alert('Google SSO is in demo mode. Please log in with email and password.')}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2.5 transition focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* Register Link */}
            <p className="text-center text-xs text-slate-500 pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
