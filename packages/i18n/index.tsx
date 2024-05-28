import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import enTranslations from './strings/en.json';

type Translations = typeof enTranslations;

const translationGetters = {
  de: () => import('./strings/de.json'),
};

interface Strings {
  t: Translations;
  pt: (s: string, args?: object) => string;
}

const I18NContext = createContext<Strings>({
  t: enTranslations,
  pt: (s) => s,
});

export const useTranslations = () => useContext(I18NContext);

export const I18N = ({ children }) => {
  const locale = navigator.languages[0];
  const [translations, setTranslations] =
    useState<Translations>(enTranslations);
  useEffect(() => {
    if (locale.startsWith('en')) {
      return;
    }
    translationGetters[locale]?.().then((_translations) => {
      setTranslations({
        ...translations,
        ..._translations,
      });
    });
  }, [locale, translations]);

  const parameterisedTransalte = (translation, args?: object) => {
    Object.entries(args).forEach(([key, value]) => {
      translation = translation.replace(`{${key}}`, value);
    });
    return translation;
  };
  return (
    <I18NContext.Provider
      value={{ t: translations, pt: parameterisedTransalte }}
    >
      {children}
    </I18NContext.Provider>
  );
};
