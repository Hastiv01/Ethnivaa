import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Lock, User, KeyRound, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ mode: initialMode }) => {
  const { login, signup, navigateTo, pendingAction } = useShop();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'details'>('email');
  const [signupEmail, setSignupEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Notification Banner State
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setAuthMode(initialMode);
    resetForms();
  }, [initialMode]);

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupStep('email');
    setSignupEmail('');
    setGeneratedOtp('');
    setEnteredOtp('');
    setSignupUsername('');
    setSignupPassword('');
    setInfoMessage(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const displayMessage = (type: 'info' | 'error' | 'success', text: string) => {
    if (type === 'info') {
      setInfoMessage(text);
      setErrorMessage(null);
      setSuccessMessage(null);
    } else if (type === 'error') {
      setErrorMessage(text);
      setInfoMessage(null);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(text);
      setInfoMessage(null);
      setErrorMessage(null);
    }
  };

  // Login Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      displayMessage('error', 'Please fill in all fields.');
      return;
    }
    
    const result = login(loginEmail, loginPassword);
    if (result.success) {
      displayMessage('success', result.message);
      // Post-login redirect logic is automatically handled by the ShopContext useEffect!
      // But if there is no pending action, let's navigate to home
      setTimeout(() => {
        if (!pendingAction) {
          navigateTo('home');
        }
      }, 1000);
    } else {
      displayMessage('error', result.message);
    }
  };

  // Signup Step 1: Send Email -> Show OTP entry
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail) {
      displayMessage('error', 'Please enter a valid email address.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      displayMessage('error', 'Please enter a valid email format.');
      return;
    }

    // Generate simulated OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    // Simulate sending OTP from backend
    // Since backend does the mailing, we display a gorgeous notification with the code for testing
    setSignupStep('otp');
    displayMessage('info', `Simulated Email Sent! Your OTP is ${code}. Please enter it below.`);
  };

  // Signup Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp) {
      displayMessage('error', 'Please enter the 6-digit verification code.');
      return;
    }

    if (enteredOtp === generatedOtp) {
      setSignupStep('details');
      displayMessage('success', 'Email verified successfully! Complete your profile.');
    } else {
      displayMessage('error', 'Invalid verification code. Please check your simulated OTP and try again.');
    }
  };

  // Signup Step 3: Complete registration
  const handleCompleteSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword) {
      displayMessage('error', 'Please enter your username and set a secure password.');
      return;
    }

    if (signupPassword.length < 6) {
      displayMessage('error', 'Password must be at least 6 characters long.');
      return;
    }

    const result = signup(signupEmail, signupUsername, signupPassword);
    if (result.success) {
      displayMessage('success', result.message);
      // Redirect is handled by context useEffect or default to home
      setTimeout(() => {
        if (!pendingAction) {
          navigateTo('home');
        }
      }, 1000);
    } else {
      displayMessage('error', result.message);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 py-16 bg-ivory-100 overflow-hidden font-sans">
      {/* Background radial accent designs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-crimson-800/5 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Main Glassmorphic Card */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md border border-gold-300/40 rounded-3xl shadow-gold-xl p-8 sm:p-10 animate-scaleIn z-10 transition-all duration-300">
        
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8">
          <span className="font-serif text-3xl font-extrabold tracking-widest text-crimson-950 block">
            ETHNIVAA
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-gold-600 font-bold block">
            THE HERITAGE OF JEWELRY
          </span>
          <div className="w-12 h-0.5 bg-gold-400 mx-auto mt-2"></div>
        </div>

        {/* Message Banner Alerts */}
        {infoMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-gold-50 border border-gold-200/50 text-gold-950 text-xs flex gap-2.5 animate-fadeIn">
            <Sparkles size={16} className="text-gold-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">{infoMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-crimson-50 border border-crimson-100 text-crimson-900 text-xs flex gap-2.5 animate-fadeIn">
            <AlertCircle size={16} className="text-crimson-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs flex gap-2.5 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">{successMessage}</p>
          </div>
        )}

        {/* --------------------- LOGIN FORM --------------------- */}
        {authMode === 'login' && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="font-serif text-xl font-bold text-crimson-950">Welcome Back</h2>
              <p className="text-[11px] text-obsidian-500 font-light">Enter your details to log in to your boutique profile</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-obsidian-850">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                  />
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-obsidian-850">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                  />
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Log In</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-gold-100 text-xs">
              <span className="text-obsidian-500 font-light">New to Ethnivaa? </span>
              <button
                onClick={() => { setAuthMode('signup'); resetForms(); }}
                className="font-bold text-crimson-900 hover:text-gold-600 transition-colors uppercase tracking-wider"
              >
                Sign Up Now
              </button>
            </div>
          </div>
        )}

        {/* --------------------- SIGNUP FORM --------------------- */}
        {authMode === 'signup' && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="font-serif text-xl font-bold text-crimson-950">Create Account</h2>
              <p className="text-[11px] text-obsidian-500 font-light">Join the heritage club for curated luxury benefits</p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-wider font-sans text-obsidian-400 py-2 border-y border-gold-100/50">
              <span className={signupStep === 'email' ? 'text-crimson-900' : 'opacity-60'}>1. Email</span>
              <span className="opacity-30">/</span>
              <span className={signupStep === 'otp' ? 'text-crimson-900' : 'opacity-60'}>2. Verify OTP</span>
              <span className="opacity-30">/</span>
              <span className={signupStep === 'details' ? 'text-crimson-900' : 'opacity-60'}>3. Password</span>
            </div>

            {/* STEP 1: ENTER EMAIL */}
            {signupStep === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Enter Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. guest@royal.com"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                  <p className="text-[10px] text-obsidian-400 font-light leading-normal mt-1">
                    An verification code (OTP) will be simulated for frontend testing.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Get Verification Code</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {signupStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <button
                  type="button"
                  onClick={() => { setSignupStep('email'); setErrorMessage(null); }}
                  className="text-[10px] font-bold text-gold-600 hover:text-crimson-900 flex items-center gap-1 transition-colors uppercase tracking-wider mb-2"
                >
                  <ArrowLeft size={10} />
                  <span>Change Email ({signupEmail})</span>
                </button>

                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Enter 6-Digit OTP Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      pattern="\d{6}"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-center tracking-[0.8em] font-mono font-bold text-base text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <KeyRound size={16} className="absolute left-3.5 top-4 text-gold-600" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-obsidian-400 font-light mt-1">
                    <span>Didn't get the code?</span>
                    <button
                      type="button"
                      onClick={() => {
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(code);
                        displayMessage('info', `New code sent! Your OTP is ${code}. Please enter it above.`);
                      }}
                      className="font-semibold text-crimson-900 hover:text-gold-600 transition-colors uppercase"
                    >
                      Resend
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Verify and Proceed</span>
                  <CheckCircle2 size={14} />
                </button>
              </form>
            )}

            {/* STEP 3: SET USERNAME & PASSWORD */}
            {signupStep === 'details' && (
              <form onSubmit={handleCompleteSignup} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Boutique Display Name (Username)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <User size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Set Account Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Complete Sign Up</span>
                  <CheckCircle2 size={14} />
                </button>
              </form>
            )}

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-gold-100 text-xs">
              <span className="text-obsidian-500 font-light">Already have an account? </span>
              <button
                onClick={() => { setAuthMode('login'); resetForms(); }}
                className="font-bold text-crimson-900 hover:text-gold-600 transition-colors uppercase tracking-wider"
              >
                Log In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
