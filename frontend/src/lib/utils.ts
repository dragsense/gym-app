import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function buildRoutePath(path: string, params?: RouteParam, queryParams?: Record<string, string | number>): string {
  let result = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      let valueStr = String(value);
      result = result.replace(`:${key}`, valueStr);
    }
  }

  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
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
 * @param currency The currency code (e.g., 'USD', 'EUR')
 * @param locale The locale to use (defaults to browser locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
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
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
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
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Additional currency-related utilities
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: 'CN¥',
  HKD: 'HK$',
  SGD: 'S$',
  // Add more currencies as needed
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