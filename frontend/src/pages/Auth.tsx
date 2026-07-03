import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Mail, Lock, User, KeyRound, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ mode: initialMode }) => {
  const { 
    login, 
    startSignup, 
    verifySignupOtp, 
    completeSignup, 
    googleSignIn, 
    navigateTo, 
    pendingAction,
    startPasswordReset,
    verifyPasswordResetOtp,
    completePasswordReset
  } = useShop();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'details'>('email');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAgree, setSignupAgree] = useState(false);

  // Forgot password fields
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // OTP Cooldown Timers
  const [signupTimer, setSignupTimer] = useState(0);
  const [forgotTimer, setForgotTimer] = useState(0);

  // Notification Banner State
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const hasGoogleConfig = Boolean(googleClientId);

  useEffect(() => {
    setAuthMode(initialMode);
    resetForms();
  }, [initialMode]);

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupStep('email');
    setSignupName('');
    setSignupEmail('');
    setEnteredOtp('');
    setSignupToken('');
    setSignupUsername('');
    setSignupPassword('');
    setSignupAgree(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setForgotResetToken('');
    setForgotPassword('');
    setForgotConfirmPassword('');
    setInfoMessage(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSignupTimer(0);
    setForgotTimer(0);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSignupTimer(prev => (prev > 0 ? prev - 1 : 0));
      setForgotTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkAndRedirectHome = () => {
    if (!pendingAction) {
      const role = localStorage.getItem('ethnivaa_current_user_role');
      const isRoleAdmin = role ? JSON.parse(role) === 'ADMIN' : false;
      if (!isRoleAdmin) {
        navigateTo('home');
      }
    }
  };

  useEffect(() => {
    if (!hasGoogleConfig) {
      return;
    }

    const renderGoogleButton = () => {
      const google = (window as Window & { google?: any }).google;
      if (!googleButtonRef.current || !googleClientId || !google) {
        return false;
      }

      googleButtonRef.current.innerHTML = '';
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            displayMessage('error', 'Google sign-in did not return a credential.');
            return;
          }

          const result = await googleSignIn(response.credential);
          if (result.success) {
            displayMessage('success', result.message);
            setTimeout(() => {
              checkAndRedirectHome();
            }, 1000);
          } else {
            displayMessage('error', result.message);
          }
        },
      });

      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
      });

      return true;
    };

    if (renderGoogleButton()) {
      return;
    }

    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!script) {
      return;
    }

    const onLoad = () => renderGoogleButton();
    script.addEventListener('load', onLoad);

    const intervalId = window.setInterval(() => {
      if (renderGoogleButton()) {
        window.clearInterval(intervalId);
        script.removeEventListener('load', onLoad);
      }
    }, 200);

    return () => {
      script.removeEventListener('load', onLoad);
      window.clearInterval(intervalId);
    };
  }, [authMode, googleClientId, googleSignIn, pendingAction, navigateTo]);

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
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      displayMessage('error', 'Please fill in all fields.');
      return;
    }
    
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      displayMessage('success', result.message);
      // Post-login redirect logic is automatically handled by the ShopContext useEffect!
      // But if there is no pending action, let's navigate to home
      setTimeout(() => {
        checkAndRedirectHome();
      }, 1000);
    } else {
      displayMessage('error', result.message);
    }
  };

  // Signup Step 1: Send Email -> Show OTP entry
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupAgree) {
      displayMessage('error', 'You must agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    if (!signupName || !signupEmail) {
      displayMessage('error', 'Please enter your full name and email address.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      displayMessage('error', 'Please enter a valid email format.');
      return;
    }

    const result = await startSignup(signupName, signupEmail);
    if (result.success) {
      setSignupStep('otp');
      setSignupTimer(30);
      displayMessage('info', result.message || 'OTP sent to your email.');
      return;
    }

    displayMessage('error', result.message);
  };

  const handleResendSignupOtp = async () => {
    if (signupTimer > 0) return;
    setErrorMessage(null);
    const result = await startSignup(signupName, signupEmail);
    if (result.success) {
      setSignupTimer(30);
      displayMessage('success', 'A new verification code has been sent to your email.');
    } else {
      displayMessage('error', result.message);
    }
  };

  // Signup Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp) {
      displayMessage('error', 'Please enter the 6-digit verification code.');
      return;
    }

    const result = await verifySignupOtp(signupEmail, enteredOtp);
    if (result.success && result.signupToken) {
      setSignupToken(result.signupToken);
      setSignupStep('details');
      displayMessage('success', result.message || 'Email verified successfully! Complete your profile.');
      return;
    }

    displayMessage('error', result.message);
  };

  // Signup Step 3: Complete registration
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword) {
      displayMessage('error', 'Please enter your username and set a secure password.');
      return;
    }

    if (signupPassword.length < 8) {
      displayMessage('error', 'Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(signupPassword)) {
      displayMessage('error', 'Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(signupPassword)) {
      displayMessage('error', 'Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(signupPassword)) {
      displayMessage('error', 'Password must contain at least one special character (e.g. @, #, !, $).');
      return;
    }

    if (!signupToken) {
      displayMessage('error', 'Please verify your OTP before continuing.');
      return;
    }

    const result = await completeSignup(signupToken, signupPassword);
    if (result.success) {
      displayMessage('success', result.message);
      // Redirect is handled by context useEffect or default to home
      setTimeout(() => {
        checkAndRedirectHome();
      }, 1000);
    } else {
      displayMessage('error', result.message);
    }
  };

  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      displayMessage('error', 'Please enter your email address.');
      return;
    }
    const result = await startPasswordReset(forgotEmail);
    if (result.success) {
      setForgotStep('otp');
      setForgotTimer(30);
      displayMessage('info', result.message || 'Verification code sent to your email.');
    } else {
      displayMessage('error', result.message);
    }
  };

  const handleResendForgotOtp = async () => {
    if (forgotTimer > 0) return;
    setErrorMessage(null);
    const result = await startPasswordReset(forgotEmail);
    if (result.success) {
      setForgotTimer(30);
      displayMessage('success', 'A new verification code has been sent to your email.');
    } else {
      displayMessage('error', result.message);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp) {
      displayMessage('error', 'Please enter the 6-digit verification code.');
      return;
    }
    const result = await verifyPasswordResetOtp(forgotEmail, forgotOtp);
    if (result.success && result.resetToken) {
      setForgotResetToken(result.resetToken);
      setForgotStep('password');
      displayMessage('success', 'Email verified successfully! Choose a new password.');
    } else {
      displayMessage('error', result.message);
    }
  };

  const handleForgotComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPassword || !forgotConfirmPassword) {
      displayMessage('error', 'Please fill in all fields.');
      return;
    }
    if (forgotPassword.length < 8) {
      displayMessage('error', 'Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(forgotPassword)) {
      displayMessage('error', 'Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(forgotPassword)) {
      displayMessage('error', 'Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(forgotPassword)) {
      displayMessage('error', 'Password must contain at least one special character (e.g. @, #, !, $).');
      return;
    }
    if (forgotPassword !== forgotConfirmPassword) {
      displayMessage('error', 'Passwords do not match.');
      return;
    }
    const result = await completePasswordReset(forgotResetToken, forgotPassword);
    if (result.success) {
      displayMessage('success', result.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setAuthMode('login');
        resetForms();
      }, 2000);
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
            THE HERITAGE OF JEWELLERY
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
                <div className="flex justify-between items-center">
                  <label className="font-bold text-obsidian-850">Password</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); resetForms(); }}
                    className="text-[10px] font-bold text-crimson-900 hover:text-gold-600 transition-colors uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                </div>
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

            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-obsidian-300">
              <span className="h-px flex-1 bg-gold-100"></span>
              <span>Or continue with Google</span>
              <span className="h-px flex-1 bg-gold-100"></span>
            </div>

            <div className="space-y-3">
              {hasGoogleConfig ? (
                <div ref={googleButtonRef} className="flex justify-center"></div>
              ) : (
                <button
                  type="button"
                  onClick={() => displayMessage('error', 'Missing VITE_GOOGLE_CLIENT_ID in the frontend .env file. Put it in the project root, not backend/.env, then restart Vite.')}
                  className="w-full border border-gold-200 bg-white hover:bg-ivory-50 text-crimson-950 font-semibold rounded-full py-3.5 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span className="text-lg">G</span>
                  <span>Continue with Google</span>
                </button>
              )}
              {!hasGoogleConfig && (
                <p className="text-[10px] text-obsidian-400 text-center leading-relaxed">
                  Add <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span> to the root <span className="font-semibold">.env</span> file and restart the frontend dev server.
                </p>
              )}
            </div>

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-gold-100 text-xs">
              <span className="text-obsidian-500 font-light">New to Ethnivaa? </span>
              <button
                onClick={() => { navigate('/signup'); resetForms(); }}
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
              <span className={signupStep === 'email' ? 'text-crimson-900' : 'opacity-60'}>1. Name + Email</span>
              <span className="opacity-30">/</span>
              <span className={signupStep === 'otp' ? 'text-crimson-900' : 'opacity-60'}>2. Verify OTP</span>
              <span className="opacity-30">/</span>
              <span className={signupStep === 'details' ? 'text-crimson-900' : 'opacity-60'}>3. Password</span>
            </div>

            {/* STEP 1: ENTER EMAIL */}
            {signupStep === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <User size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                </div>

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
                    An OTP will be sent to your email through the backend.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 py-1">
                  <input
                    id="agree-signup-terms"
                    type="checkbox"
                    checked={signupAgree}
                    onChange={(e) => setSignupAgree(e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 rounded border-gold-200 text-crimson-950 focus:ring-crimson-900 cursor-pointer"
                  />
                  <label htmlFor="agree-signup-terms" className="text-[11px] text-obsidian-500 font-light leading-normal cursor-pointer select-none">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-crimson-900 hover:text-gold-600 underline">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-crimson-900 hover:text-gold-600 underline">
                      Privacy Policy
                    </a>.
                  </label>
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
                      disabled={signupTimer > 0}
                      onClick={handleResendSignupOtp}
                      className={`font-semibold transition-colors uppercase ${
                        signupTimer > 0 
                          ? 'text-obsidian-350 cursor-not-allowed' 
                          : 'text-crimson-950 hover:text-gold-600'
                      }`}
                    >
                      {signupTimer > 0 ? `Resend in ${signupTimer}s` : 'Resend OTP'}
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
                      placeholder="Min 8 chars, uppercase, number, symbol"
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

            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-obsidian-300">
              <span className="h-px flex-1 bg-gold-100"></span>
              <span>Or continue with Google</span>
              <span className="h-px flex-1 bg-gold-100"></span>
            </div>

            <div className="space-y-3">
              {hasGoogleConfig ? (
                <div ref={googleButtonRef} className="flex justify-center"></div>
              ) : (
                <button
                  type="button"
                  onClick={() => displayMessage('error', 'Missing VITE_GOOGLE_CLIENT_ID in the frontend .env file. Put it in the project root, not backend/.env, then restart Vite.')}
                  className="w-full border border-gold-200 bg-white hover:bg-ivory-50 text-crimson-950 font-semibold rounded-full py-3.5 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span className="text-lg">G</span>
                  <span>Continue with Google</span>
                </button>
              )}
              {!hasGoogleConfig && (
                <p className="text-[10px] text-obsidian-400 text-center leading-relaxed">
                  Add <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span> to the root <span className="font-semibold">.env</span> file and restart the frontend dev server.
                </p>
              )}
            </div>

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-gold-100 text-xs">
              <span className="text-obsidian-500 font-light">Already have an account? </span>
              <button
                onClick={() => { navigate('/login'); resetForms(); }}
                className="font-bold text-crimson-900 hover:text-gold-600 transition-colors uppercase tracking-wider"
              >
                Log In
              </button>
            </div>
          </div>
        )}
        {/* --------------------- FORGOT PASSWORD FORM --------------------- */}
        {authMode === 'forgot' && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="font-serif text-xl font-bold text-crimson-950">Reset Password</h2>
              <p className="text-[11px] text-obsidian-500 font-light">Recover access to your luxury jewellery account</p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-wider font-sans text-obsidian-400 py-2 border-y border-gold-100/50">
              <span className={forgotStep === 'email' ? 'text-crimson-900' : 'opacity-60'}>1. Email</span>
              <span className="opacity-30">/</span>
              <span className={forgotStep === 'otp' ? 'text-crimson-900' : 'opacity-60'}>2. Verify OTP</span>
              <span className="opacity-30">/</span>
              <span className={forgotStep === 'password' ? 'text-crimson-900' : 'opacity-60'}>3. New Password</span>
            </div>

            {/* STEP 1: ENTER EMAIL */}
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotSendOtp} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Registered Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                  <p className="text-[10px] text-obsidian-400 font-light leading-normal mt-1">
                    An OTP code will be sent to this email address to verify ownership.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Send Reset OTP</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {forgotStep === 'otp' && (
              <form onSubmit={handleForgotVerifyOtp} className="space-y-4 text-xs">
                <button
                  type="button"
                  onClick={() => { setForgotStep('email'); setErrorMessage(null); }}
                  className="text-[10px] font-bold text-gold-600 hover:text-crimson-900 flex items-center gap-1 transition-colors uppercase tracking-wider mb-2"
                >
                  <ArrowLeft size={10} />
                  <span>Change Email ({forgotEmail})</span>
                </button>

                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Enter 6-Digit OTP Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      pattern="\d{6}"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-center tracking-[0.8em] font-mono font-bold text-base text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <KeyRound size={16} className="absolute left-3.5 top-4 text-gold-600" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-obsidian-400 font-light mt-1.5">
                    <span>Didn't get the code?</span>
                    <button
                      type="button"
                      disabled={forgotTimer > 0}
                      onClick={handleResendForgotOtp}
                      className={`font-semibold transition-colors uppercase ${
                        forgotTimer > 0 
                          ? 'text-obsidian-350 cursor-not-allowed' 
                          : 'text-crimson-950 hover:text-gold-600'
                      }`}
                    >
                      {forgotTimer > 0 ? `Resend in ${forgotTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Verify OTP</span>
                  <CheckCircle2 size={14} />
                </button>
              </form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {forgotStep === 'password' && (
              <form onSubmit={handleForgotComplete} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={forgotPassword}
                      onChange={(e) => setForgotPassword(e.target.value)}
                      placeholder="Min 8 chars, uppercase, number, symbol"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-obsidian-850">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-ivory-50 border border-gold-200 focus:border-gold-500 rounded-xl py-3 pl-10 pr-4 text-obsidian-950 focus:outline-none transition-colors"
                    />
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gold-600" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Update Password</span>
                  <CheckCircle2 size={14} />
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="text-center pt-4 border-t border-gold-100 text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); resetForms(); }}
                className="font-bold text-crimson-900 hover:text-gold-600 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft size={12} />
                <span>Back to Log In</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
