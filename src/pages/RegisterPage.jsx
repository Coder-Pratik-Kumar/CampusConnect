import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Lock, GraduationCap, ArrowRight, Camera, Eye, EyeOff, RotateCw, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Client-side validations
    if (!name.trim()) {
      setFormError('Full Name is required');
      return;
    }
    if (!email.trim()) {
      setFormError('Email address is required');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        college: college.trim(),
        email: email.trim(),
        password,
      });

      setFormSuccess('Account created successfully! Signing you in...');

      // Auto login after registration
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-soft-xl border border-indigo-100/60 overflow-hidden flex flex-col md:flex-row my-auto">
      {/* Left Column: Image Banner */}
      <div className="md:w-5/12 relative min-h-[260px] md:min-h-[580px] bg-slate-900 flex flex-col justify-between p-6 sm:p-8">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000"
          alt="Campus Community"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3525CD]/95 via-[#3525CD]/70 to-[#3525CD]/40" />

        {/* Logo Header */}
        <div className="relative z-10 flex items-center gap-2 text-white">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-heading font-extrabold text-xl tracking-tight">CampusConnect</span>
        </div>

        {/* Bottom Headline & Subtitle */}
        <div className="relative z-10 space-y-2 mt-auto text-white">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl leading-snug">
            Join your campus community.
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
            Connect with peers, collaborate on projects, and build your professional network before you even graduate.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-center">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-brand-text">
            Create an account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Get started with CampusConnect today.
          </p>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-700 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{formError}</span>
          </div>
        )}

        {/* Success Banner */}
        {formSuccess && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-emerald-700 text-xs font-medium">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo Uploader Placeholder */}
          <div className="flex items-center gap-3 bg-[#F9F9FF] border border-indigo-100 rounded-2xl p-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100/70 text-brand-primary flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Profile Photo</p>
              <p className="text-[11px] text-slate-400">Optional, max 2MB</p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              label="College / University"
              placeholder="State University"
              icon={GraduationCap}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Student Email (.edu preferred)"
            type="email"
            placeholder="jane@student.edu"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={RotateCw}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Password Strength Indicator */}
          <div className="flex gap-1.5 pt-1">
            <div className={`h-1.5 flex-1 rounded-full ${password.length > 0 ? 'bg-brand-primary' : 'bg-indigo-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${password.length > 4 ? 'bg-brand-primary' : 'bg-indigo-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${password.length > 7 ? 'bg-brand-primary' : 'bg-indigo-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${password.length > 10 ? 'bg-brand-primary' : 'bg-indigo-100'}`} />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            icon={isSubmitting ? RotateCw : ArrowRight}
            iconPosition="right"
            className={`mt-2 py-2.5 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
