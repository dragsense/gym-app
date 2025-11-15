// Assets
import logo from "@/assets/logos/logo.png";

// React Router
import { Outlet } from "react-router-dom";
import { useId } from "react";

// Hooks
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export default function AuthLayout() {
  // React 19: Essential IDs
  const componentId = useId();
  const { t, direction } = useI18n();

  // For RTL, swap the order of panels
  const isRTL = direction === 'rtl';

  return (
    <div
      className="min-h-screen max-w-7xl mx-auto grid md:grid-cols-2 md:gap-10 gap-4 p-4 py-15"
      data-component-id={componentId}
      dir={direction}
    >
      {/* Welcome Panel - Left in LTR, Right in RTL */}
      <div className={`flex flex-col items-center justify-center gap-4 ${isRTL ? 'md:order-2' : 'md:order-1'}`}>
        <img src={logo} alt="FORMANCE Logo" className="w-10 md:w-10" />

        <div className={`space-y-1 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-3xl font-bold">{buildSentence(t, 'welcome', 'to', 'formance')}</h1>
          <p className={`text-sm max-w-sm ${isRTL ? 'text-right' : 'text-left'}`}>
            {buildSentence(t, 'empower', 'coaches', 'to', 'manage', 'clients', 'track', 'progress', 'and', 'deliver', 'results', 'all', 'in', 'one', 'simple', 'powerful', 'tool')}
          </p>
          <a
            href="https://linkedin.com/company/formance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            {buildSentence(t, 'visit', 'our', 'linkedin')}
          </a>
        </div>
      </div>

      {/* Form Panel - Right in LTR, Left in RTL */}
      <div className={`flex items-center justify-center ${isRTL ? 'md:order-1' : 'md:order-2'}`}>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
