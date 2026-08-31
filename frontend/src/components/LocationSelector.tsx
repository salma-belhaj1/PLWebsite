import { useMemo } from 'react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { ChevronDown, Globe, MapPin, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LocationSelectorProps {
  selectedCountry: string; // country code e.g. "TN" or country name "Tunisia"
  selectedState: string;   // state code or name e.g. "Tunis"
  selectedCity: string;    // city name
  onCountryChange: (countryName: string, countryCode: string) => void;
  onStateChange: (stateName: string, stateCode: string) => void;
  onCityChange: (cityName: string) => void;
  theme?: 'dark' | 'light';
  disabled?: boolean;
}

export function LocationSelector({
  selectedCountry,
  selectedState,
  selectedCity,
  onCountryChange,
  onStateChange,
  onCityChange,
  theme = 'dark',
  disabled = false,
}: LocationSelectorProps) {
  const { t } = useTranslation();

  // All countries
  const countries = useMemo<ICountry[]>(() => Country.getAllCountries(), []);

  // Find country code from input value (support both ISO code "TN" and full name "Tunisia")
  const currentCountryObj = useMemo(() => {
    if (!selectedCountry) return null;
    return (
      countries.find(
        (c) =>
          c.isoCode.toLowerCase() === selectedCountry.toLowerCase() ||
          c.name.toLowerCase() === selectedCountry.toLowerCase()
      ) || null
    );
  }, [selectedCountry, countries]);

  // States for selected country
  const states = useMemo<IState[]>(() => {
    if (!currentCountryObj) return [];
    return State.getStatesOfCountry(currentCountryObj.isoCode);
  }, [currentCountryObj]);

  // Find state object
  const currentStateObj = useMemo(() => {
    if (!selectedState || states.length === 0) return null;
    return (
      states.find(
        (s) =>
          s.isoCode.toLowerCase() === selectedState.toLowerCase() ||
          s.name.toLowerCase() === selectedState.toLowerCase()
      ) || null
    );
  }, [selectedState, states]);

  // Cities for selected state/country
  const cities = useMemo<ICity[]>(() => {
    if (!currentCountryObj) return [];
    if (currentStateObj) {
      const cityList = City.getCitiesOfState(currentCountryObj.isoCode, currentStateObj.isoCode);
      if (cityList.length > 0) return cityList;
    }
    return City.getCitiesOfCountry(currentCountryObj.isoCode) || [];
  }, [currentCountryObj, currentStateObj]);

  const selectStyle = `w-full px-3.5 py-2.5 rounded-xl font-century text-xs appearance-none outline-none smooth-transition border ${
    theme === 'dark'
      ? 'bg-zinc-800/90 border-zinc-700 text-white focus:border-pl-pink focus:ring-2 focus:ring-pl-pink/20'
      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-pl-pink focus:ring-2 focus:ring-pl-pink/20'
  } disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Country Select */}
      <div className="space-y-1">
        <label className={`block text-xs font-century font-semibold flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'
        }`}>
          <Globe className="w-3.5 h-3.5 text-pl-pink shrink-0" />
          <span>{t('location.country') || 'Country'}</span>
        </label>
        <div className="relative">
          <select
            value={currentCountryObj?.isoCode || ''}
            onChange={(e) => {
              const code = e.target.value;
              const country = countries.find((c) => c.isoCode === code);
              if (country) {
                onCountryChange(country.name, country.isoCode);
                onStateChange('', '');
                onCityChange('');
              } else {
                onCountryChange('', '');
                onStateChange('', '');
                onCityChange('');
              }
            }}
            disabled={disabled}
            className={selectStyle}
          >
            <option value="">{t('location.selectCountry') || 'Select Country'}</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode} className={theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-black'}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-pl-pink absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* State / Governorate Select */}
      <div className="space-y-1">
        <label className={`block text-xs font-century font-semibold flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'
        }`}>
          <MapPin className="w-3.5 h-3.5 text-pl-pink shrink-0" />
          <span>{t('location.state') || 'State / Region'}</span>
        </label>
        <div className="relative">
          {states.length > 0 ? (
            <>
              <select
                value={currentStateObj?.isoCode || ''}
                onChange={(e) => {
                  const code = e.target.value;
                  const st = states.find((s) => s.isoCode === code);
                  if (st) {
                    onStateChange(st.name, st.isoCode);
                    onCityChange('');
                  } else {
                    onStateChange('', '');
                    onCityChange('');
                  }
                }}
                disabled={disabled || !currentCountryObj}
                className={selectStyle}
              >
                <option value="">{t('location.selectState') || 'Select State / Region'}</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode} className={theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-black'}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-pl-pink absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          ) : (
            <input
              type="text"
              placeholder={t('location.statePlaceholder') || 'State or Region'}
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value, '')}
              disabled={disabled || !currentCountryObj}
              className={selectStyle}
            />
          )}
        </div>
      </div>

      {/* City Select */}
      <div className="space-y-1">
        <label className={`block text-xs font-century font-semibold flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'
        }`}>
          <Building className="w-3.5 h-3.5 text-pl-pink shrink-0" />
          <span>{t('location.city') || 'City'}</span>
        </label>
        <div className="relative">
          {cities.length > 0 ? (
            <>
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                disabled={disabled || !currentCountryObj}
                className={selectStyle}
              >
                <option value="">{t('location.selectCity') || 'Select City'}</option>
                {cities.map((city, idx) => (
                  <option key={`${city.name}-${idx}`} value={city.name} className={theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-black'}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-pl-pink absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          ) : (
            <input
              type="text"
              placeholder={t('location.enterCity') || 'Enter City'}
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              disabled={disabled || !currentCountryObj}
              className={selectStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
