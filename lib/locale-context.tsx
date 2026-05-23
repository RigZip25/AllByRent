'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Locale, detectLocale, t as translate, formatCurrency as formatCurrencyUtil } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  formatCurrency: (amount: number, currency?: string) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  
  useEffect(() => {
    // Detect browser language on mount
    const detected = detectLocale()
    setLocaleState(detected)
    
    // Also check localStorage for user preference
    const saved = localStorage.getItem('allbyrent-locale') as Locale | null
    if (saved) {
      setLocaleState(saved)
    }
  }, [])
  
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('allbyrent-locale', newLocale)
  }
  
  const t = (key: string) => translate(locale, key)
  
  const formatCurrency = (amount: number, currency?: string) => 
    formatCurrencyUtil(amount, locale, currency)
  
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, formatCurrency }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
