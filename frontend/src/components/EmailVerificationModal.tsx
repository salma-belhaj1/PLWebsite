import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  generatedCode: string;
  onVerifySuccess: () => void;
  onClose: () => void;
  onResend: () => string; // returns new code
}

export function EmailVerificationModal({
  isOpen,
  email,
  generatedCode,
  onVerifySuccess,
  onClose,
  onResend,
}: EmailVerificationModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [currentCode, setCurrentCode] = useState(generatedCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCode(generatedCode);
  }, [generatedCode]);

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentCode]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setErrorMsg(null);
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const arr = pastedData.split('');
      setDigits(arr);
      const lastInput = document.getElementById('otp-input-5');
      lastInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(t('verifyModal.enterAllDigits') || 'Please enter all 6 digits of the confirmation code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (fullCode === currentCode) {
        toast.success(t('verifyModal.verifiedSuccess') || 'Email verified successfully! Welcome to Peace & Love.');
        setIsVerifying(false);
        onVerifySuccess();
      } else {
        setIsVerifying(false);
        setErrorMsg(t('verifyModal.invalidCode') || 'Invalid verification code. Please check and try again.');
        toast.error(t('verifyModal.incorrectCode') || 'Incorrect code. Try again or check the simulation box.');
      }
    }, 600);
  };

  const handleAutoFill = () => {
    const arr = currentCode.split('');
    setDigits(arr);
    setErrorMsg(null);
    toast.success(t('verifyModal.autoFilled') || 'Confirmation code auto-filled');
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    const newCode = onResend();
    setCurrentCode(newCode);
    setDigits(['', '', '', '', '', '']);
    setCountdown(60);
    setErrorMsg(null);
    toast.success(t('verifyModal.codeResent') || 'New verification code sent!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 backdrop-blur-md ${
              theme === 'dark' ? 'bg-black/80' : 'bg-stone-900/60'
            }`}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            className={`relative w-full max-w-md rounded-3xl border-2 p-6 sm:p-8 shadow-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 text-white'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pl-pink via-pl-red to-pl-pink" />

            {/* Icon & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pl-pink/10 text-pl-pink border border-pl-pink/20 mb-3 shadow-inner">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-stayvibes text-pl-pink">
                {t('verifyModal.title') || 'Confirm Your Email'}
              </h3>
              <p className={`text-xs font-century mt-1 leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`}>
                {t('verifyModal.sentTo') || 'We sent a 6-digit confirmation code to:'}
                <br />
                <span className="font-semibold text-pl-pink font-mono text-sm">{email}</span>
              </p>
            </div>

            {/* Code Helper Preview (Realistic Email Simulation) */}
            <div className={`mb-5 p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
              theme === 'dark' ? 'bg-zinc-800/60 border-zinc-700' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-70 block">
                  {t('verifyModal.notificationLabel') || 'Security Code Notification'}
                </span>
                <span className="font-mono text-sm font-bold text-pl-pink tracking-widest">
                  {currentCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="px-3 py-1.5 rounded-xl text-xs font-century font-semibold bg-pl-pink/15 text-pl-pink hover:bg-pl-pink/25 border border-pl-pink/30 smooth-transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t('verifyModal.autoFill') || 'Auto-Fill'}</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-century">
                {errorMsg}
              </div>
            )}

            {/* 6 Digit Inputs */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 outline-none smooth-transition ${
                      digit
                        ? 'border-pl-pink bg-pl-pink/5 text-pl-pink'
                        : theme === 'dark'
                        ? 'border-zinc-700 bg-zinc-800 text-white focus:border-pl-pink'
                        : 'border-stone-300 bg-stone-50 text-black focus:border-pl-pink'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-2xl font-century font-semibold text-xs bg-gradient-to-r from-pl-pink to-pl-red text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-pl-pink/30 cursor-pointer disabled:opacity-50 smooth-transition"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('verifyModal.verifying') || 'Verifying Code...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('verifyModal.verifyAndShop') || 'Verify & Go to Shop'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs font-century">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className={`flex items-center gap-1 ${
                      countdown > 0
                        ? 'text-zinc-500 cursor-not-allowed'
                        : 'text-pl-pink hover:underline cursor-pointer font-semibold'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${countdown > 0 ? '' : 'text-pl-pink'}`} />
                    <span>
                      {countdown > 0 
                        ? (t('verifyModal.resendCountdown', { count: countdown }) || `Resend code in ${countdown}s`)
                        : (t('verifyModal.resend') || 'Resend Code')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-zinc-500 hover:text-zinc-400 hover:underline cursor-pointer"
                  >
                    {t('verifyModal.cancel') || 'Cancel'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
