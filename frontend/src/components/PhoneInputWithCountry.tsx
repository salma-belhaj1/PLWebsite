import React, { useState, useMemo } from 'react';
import { Country } from 'country-state-city';
import { Phone, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PhoneInputProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  defaultDialCode?: string;
  theme?: 'dark' | 'light';
  disabled?: boolean;
}

export function PhoneInputWithCountry({
  value,
  onChange,
  defaultDialCode = '+216', // Default Tunisia
  theme = 'dark',
  disabled = false,
}: PhoneInputProps) {
  const { t } = useTranslation();

  // Extract country calling code list
  const countries = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      name: c.name,
      isoCode: c.isoCode,
      flag: c.flag,
      phonecode: c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`,
    }));
  }, []);

  const [selectedDialCode, setSelectedDialCode] = useState(() => {
    if (value && value.startsWith('+')) {
      const match = countries.find((c) => value.startsWith(c.phonecode));
      if (match) return match.phonecode;
    }
    return defaultDialCode;
  });

  const currentCountry = useMemo(() => {
    return countries.find((c) => c.phonecode === selectedDialCode) || {
      isoCode: 'TN',
      phonecode: '+216',
      flag: '🇹🇳',
      name: 'Tunisia',
    };
  }, [selectedDialCode, countries]);

  const rawNumber = useMemo(() => {
    if (value && value.startsWith(selectedDialCode)) {
      return value.slice(selectedDialCode.length).trim().replace(/\D/g, '').slice(0, 8);
    }
    return value.replace(/^\+\d+\s*/, '').replace(/\D/g, '').slice(0, 8);
  }, [value, selectedDialCode]);

  const handleDialCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedDialCode(newCode);
    onChange(rawNumber ? `${newCode} ${rawNumber}` : newCode);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numbers and restrict to exactly 8 digits max
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(onlyDigits ? `${selectedDialCode} ${onlyDigits}` : '');
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className={`block text-xs font-century font-semibold flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'
        }`}>
          <Phone className="w-3.5 h-3.5 text-pl-pink shrink-0" />
          <span>{t('form.phone') || 'Phone Number'}</span>
        </label>
        <span className={`text-[10px] font-mono ${
          rawNumber.length === 8 ? 'text-green-500 font-semibold' : 'opacity-60'
        }`}>
          {rawNumber.length}/8 {t('form.digits') || 'digits'}
        </span>
      </div>

      {/* Unified Compact Input Group */}
      <div className={`flex items-center rounded-xl border smooth-transition overflow-hidden focus-within:ring-2 focus-within:ring-pl-pink/30 ${
        theme === 'dark'
          ? 'bg-zinc-800/90 border-zinc-700 focus-within:border-pl-pink'
          : 'bg-stone-50 border-stone-200 focus-within:border-pl-pink'
      }`}>
        {/* Micro Dial Code Selector showing ONLY Flag with minimal space */}
        <div className={`relative flex items-center border-r shrink-0 ${
          theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-stone-100/90'
        }`}>
          {/* Custom micro visible label with flag only */}
          <div className="flex items-center pl-2 pr-3.5 py-2 pointer-events-none select-none">
            <span className="text-sm leading-none">{currentCountry.flag}</span>
          </div>

          {/* Invisible HTML select over the label for dropdown selection */}
          <select
            value={selectedDialCode}
            onChange={handleDialCodeChange}
            disabled={disabled}
            aria-label="Country dial code"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {countries.map((c) => (
              <option 
                key={`${c.isoCode}-${c.phonecode}`} 
                value={c.phonecode}
                className={theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-black font-sans'}
              >
                {c.flag} {c.phonecode} - {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-2.5 h-2.5 text-pl-pink absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Large, expanded numeric phone number field (numbers only, max 8 digits) */}
        <div className="flex-1 relative flex items-center">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={rawNumber}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder="12345678"
            className={`w-full px-3 py-2 font-mono text-sm tracking-widest font-semibold outline-none bg-transparent ${
              theme === 'dark' ? 'text-white placeholder:text-zinc-600' : 'text-stone-900 placeholder:text-stone-400'
            } disabled:opacity-50`}
          />
        </div>
      </div>
    </div>
  );
}
