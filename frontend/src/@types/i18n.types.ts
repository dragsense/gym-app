import {
  type SupportedLanguage,
  supportedLanguages,
} from "@/config/i18n.config";

export interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, options?: any) => string;
  supportedLanguages: typeof supportedLanguages;
}

export interface I18nProviderProps {
  children: React.ReactNode;
}
