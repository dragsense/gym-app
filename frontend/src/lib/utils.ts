import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from "date-fns";
import { EDateFormat, ETimeFormat } from "@shared/enums/user-settings.enum";
import type { IUserSettings } from "@shared/interfaces/settings.interface";
import { getCurrentLocale } from "@/config/locale.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function matchRoutePath(pattern: string, path: string): boolean {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return false;

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] !== pathParts[i] && !patternParts[i].startsWith(":")) {
      return false;
    }
  }

  return true;
}

type RouteParam = Record<string, string | number>;

export function buildRoutePath(
  path: string,
  params?: RouteParam,
  queryParams?: Record<string, string | number>
): string {
  let result = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const valueStr = String(value);
      result = result.replace(`:${key}`, valueStr);
    }
  }

  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    if (queryString) {
      result += `?${queryString}`;
    }
  }

  return result;
}

// lib/utils.ts

/**
 * Formats a number as currency with proper localization
 * @param amount The amount to format
 * @param currency The currency code (e.g., 'USD', 'AED', 'PKR')
 * @param locale The locale to use (defaults to browser locale or 'en-US')
 * @param settings Optional user settings to get currency from
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2,
  settings?: IUserSettings
): string {
  const currencyCode = currency || settings?.currency?.defaultCurrency || "USD";

  // Determine locale based on language if not provided
  const finalLocale = locale || getCurrentLocale();

  return new Intl.NumberFormat(finalLocale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Formats a number as percentage
 * @param value The decimal value to format (e.g., 0.95 for 95%)
 * @param decimals Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100); // Input is already a percentage (e.g., 95 for 95%)
}

/**
 * Formats a number with optional decimals
 * @param value The number to format
 * @param decimals Number of decimal places to show
 * @param locale The locale to use
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Additional currency-related utilities
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  AED: "د.إ",
  PKR: "₨",
};

/**
 * Gets the symbol for a currency code
 * @param currency The currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Converts amount to minor units (cents) for payment processing
 * @param amount The amount in major units
 * @returns Amount in minor units
 */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts amount from minor units (cents) to major units
 * @param amount The amount in minor units
 * @returns Amount in major units
 */
export function fromMinorUnits(amount: number): number {
  return amount / 100;
}

// ==================== Date/Time Formatting with User Settings ====================

/**
 * Converts EDateFormat enum to date-fns format string
 */
function getDateFormatString(dateFormat?: EDateFormat): string {
  switch (dateFormat) {
    case EDateFormat.MM_DD_YYYY:
      return "MM/dd/yyyy";
    case EDateFormat.DD_MM_YYYY:
      return "dd/MM/yyyy";
    case EDateFormat.YYYY_MM_DD:
      return "yyyy-MM-dd";
    case EDateFormat.DD_MMM_YYYY:
      return "dd MMM yyyy";
    case EDateFormat.MMM_DD_YYYY:
      return "MMM dd, yyyy";
    default:
      return "MMM dd, yyyy"; // Default format
  }
}

/**
 * Formats a date according to user settings
 * @param date The date to format
 * @param settings Optional user settings
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  settings?: IUserSettings
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dateFormat = settings?.time?.dateFormat || EDateFormat.MMM_DD_YYYY;
  const timezone = settings?.time?.timezone || "UTC";

  const formatString = getDateFormatString(dateFormat);

  // Use Intl.DateTimeFormat for timezone support
  const timeZone = timezone === "UTC" ? "UTC" : timezone;

  // Determine locale based on language
  const locale = getCurrentLocale();

  // For date-only formatting, use date-fns with timezone conversion
  try {
    return dateFnsFormat(dateObj, formatString);
  } catch {
    // Fallback to Intl if date-fns fails
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: timeZone,
    }).format(dateObj);
  }
}

/**
 * Formats a time according to user settings
 * @param date The date/time to format
 * @param settings Optional user settings
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  settings?: IUserSettings
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const timeFormat = settings?.time?.timeFormat || ETimeFormat.TWELVE_HOUR;
  const timezone = settings?.time?.timezone || "UTC";

  const timeZone = timezone === "UTC" ? "UTC" : timezone;
  const hour12 = timeFormat === ETimeFormat.TWELVE_HOUR;

  // Determine locale based on language
  const locale = getCurrentLocale();

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: hour12,
    timeZone: timeZone,
  }).format(dateObj);
}

/**
 * Formats a date and time according to user settings
 * @param date The date/time to format
 * @param settings Optional user settings
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string,
  settings?: IUserSettings
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const dateStr = formatDate(dateObj, settings);
  const timeStr = formatTime(dateObj, settings);

  return `${dateStr} ${timeStr}`;
}

/**
 * Formats a timestamp (createdAt, updatedAt, etc.) according to user settings
 * @param date The date to format
 * @param settings Optional user settings
 * @returns Formatted timestamp string
 */
export function formatTimestamp(
  date: Date | string,
  settings?: IUserSettings
): string {
  return formatDateTime(date, settings);
}
