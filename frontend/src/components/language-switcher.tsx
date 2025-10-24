import { useI18n } from '@/hooks/use-i18n';

export function LanguageSwitcher() {
    const { language, setLanguage, supportedLanguages } = useI18n();

    return (
        <div className="flex items-center gap-2">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="px-3 py-1 border rounded-md bg-background text-foreground"
            >
                {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
