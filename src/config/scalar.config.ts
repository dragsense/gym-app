import { ApiReferenceOptions } from '@scalar/nestjs-api-reference';
import { registerAs } from '@nestjs/config';

export const scalarConfig: ApiReferenceOptions = {
  // Basic configuration
  title: 'Customer App Web API',
  meta: {
    description: 'Empower coaches to manage clients, track progress, and deliver results — all in one simple, powerful tool.',
  },
  
  // Theme configuration - using proper theme
  theme: 'purple', // Available: 'default', 'alternate', 'moon', 'purple', 'solarized'
  
  // Layout configuration
  configuration: {
    theme: 'purple',
    layout: 'modern',
    showSidebar: true,
    hideDownloadButton: false,
    hideTryItPanel: false,
    hideSchema: false,
    hideModels: false,
  },
  
  // Custom styling with proper theme colors
  customCss: `
    .scalar-app {
      --scalar-color-1: #6366f1;
      --scalar-color-2: #8b5cf6;
      --scalar-color-3: #d946ef;
      --scalar-color-accent: #8b5cf6;
      --scalar-color-background: #0f0f23;
      --scalar-color-text: #ffffff;
      --scalar-color-text-secondary: #a1a1aa;
      --scalar-color-border: #27272a;
      --scalar-color-sidebar: #18181b;
    }
    
    /* Purple theme enhancements */
    .scalar-app[data-theme="purple"] {
      --scalar-color-1: #8b5cf6;
      --scalar-color-2: #a855f7;
      --scalar-color-3: #c084fc;
      --scalar-color-accent: #8b5cf6;
    }
  `,
};

// Alternative theme configurations with proper theming
export const scalarThemes = {
  default: {
    ...scalarConfig,
    theme: 'default',
    configuration: { ...scalarConfig.configuration, theme: 'default' },
    customCss: `
      .scalar-app {
        --scalar-color-1: #3b82f6;
        --scalar-color-2: #1d4ed8;
        --scalar-color-3: #1e40af;
        --scalar-color-accent: #3b82f6;
      }
    `,
  },
  
  moon: {
    ...scalarConfig,
    theme: 'moon',
    configuration: { ...scalarConfig.configuration, theme: 'moon' },
    customCss: `
      .scalar-app {
        --scalar-color-1: #f59e0b;
        --scalar-color-2: #d97706;
        --scalar-color-3: #b45309;
        --scalar-color-accent: #f59e0b;
        --scalar-color-background: #1a1a1a;
        --scalar-color-text: #ffffff;
      }
    `,
  },
  
  purple: {
    ...scalarConfig,
    theme: 'purple',
    configuration: { ...scalarConfig.configuration, theme: 'purple' },
    customCss: `
      .scalar-app {
        --scalar-color-1: #8b5cf6;
        --scalar-color-2: #a855f7;
        --scalar-color-3: #c084fc;
        --scalar-color-accent: #8b5cf6;
        --scalar-color-background: #0f0f23;
        --scalar-color-text: #ffffff;
        --scalar-color-text-secondary: #a1a1aa;
        --scalar-color-border: #27272a;
        --scalar-color-sidebar: #18181b;
      }
    `,
  },
  
  solarized: {
    ...scalarConfig,
    theme: 'solarized',
    configuration: { ...scalarConfig.configuration, theme: 'solarized' },
    customCss: `
      .scalar-app {
        --scalar-color-1: #268bd2;
        --scalar-color-2: #2aa198;
        --scalar-color-3: #859900;
        --scalar-color-accent: #268bd2;
        --scalar-color-background: #002b36;
        --scalar-color-text: #839496;
      }
    `,
  },
  
  alternate: {
    ...scalarConfig,
    theme: 'alternate',
    configuration: { ...scalarConfig.configuration, theme: 'alternate' },
    customCss: `
      .scalar-app {
        --scalar-color-1: #10b981;
        --scalar-color-2: #059669;
        --scalar-color-3: #047857;
        --scalar-color-accent: #10b981;
        --scalar-color-background: #f8fafc;
        --scalar-color-text: #1e293b;
      }
    `,
  },
};

// Config registration function
export default registerAs('scalar', () => ({
  theme: process.env.SCALAR_THEME || 'purple',
  title: process.env.SCALAR_TITLE || 'Customer App Web API',
  description: process.env.SCALAR_DESCRIPTION || 'Empower coaches to manage clients, track progress, and deliver results — all in one simple, powerful tool.',
  showSidebar: process.env.SCALAR_SHOW_SIDEBAR !== 'false',
  hideDownloadButton: process.env.SCALAR_HIDE_DOWNLOAD === 'true',
  hideTryItPanel: process.env.SCALAR_HIDE_TRY_IT === 'true',
  layout: process.env.SCALAR_LAYOUT || 'modern',
}));
