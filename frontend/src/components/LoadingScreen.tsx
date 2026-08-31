import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

interface LoadingScreenProps {
  text?: string
  fullScreen?: boolean
  durationMs?: number
  onComplete?: () => void
}

export default function LoadingScreen({
  text,
  fullScreen = true,
  durationMs = 1800,
  onComplete,
}: LoadingScreenProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Percentage stages: 25% (1/4), 50% (half), 75% (3/4), 100% (all)
  const [stage, setStage] = useState<number>(25)

  useEffect(() => {
    const stepDuration = durationMs / 4

    const timer1 = setTimeout(() => setStage(50), stepDuration)
    const timer2 = setTimeout(() => setStage(75), stepDuration * 2)
    const timer3 = setTimeout(() => setStage(100), stepDuration * 3)
    const timerComplete = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, durationMs)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timerComplete)
    }
  }, [durationMs, onComplete])

  const logoSrc = theme === 'dark' ? '/media/logo-dark.png' : '/media/logo-light.png'

  return (
    <AnimatePresence>
      <div
        className={`${
          fullScreen ? 'fixed inset-0 z-50 min-h-screen' : 'w-full min-h-[350px]'
        } flex flex-col items-center justify-center ${
          theme === 'dark' ? 'bg-zinc-950 text-pl-white' : 'bg-white text-pl-black'
        } transition-colors duration-300 select-none`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center justify-center gap-5"
        >
          {/* Logo container with vertical top-to-bottom percentage reveal */}
          <div className="relative flex items-center justify-center">
            {/* Ghost Background Logo for silhouette reference */}
            <img
              src={logoSrc}
              alt="Peace & Love loading silhouette"
              className="h-20 md:h-24 w-auto opacity-15 pointer-events-none select-none"
            />

            {/* Vertically revealed active logo from TOP to BOTTOM (25% -> 50% -> 75% -> 100%) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none select-none transition-all duration-300 ease-out flex items-start justify-center"
              style={{
                clipPath: `inset(0 0 ${100 - stage}% 0)`,
              }}
            >
              <img
                src={logoSrc}
                alt="Peace & Love"
                className="h-20 md:h-24 w-auto drop-shadow-md"
              />
            </div>
          </div>

          {/* Status and Percentage Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`font-century text-xs md:text-sm tracking-widest font-semibold ${
                theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/70'
              }`}
            >
              {text || t('loading', { defaultValue: 'Loading..' })}
            </span>
            <span className="font-stayvibes text-sm text-pl-pink font-bold">
              {stage}%
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
