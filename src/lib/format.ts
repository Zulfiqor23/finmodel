/**
 * Formats a number with a space as the thousands separator.
 * Used for clarity in Uzbekistan/CIS regions where a comma might be confused for a decimal point.
 */
export const formatMoney = (val: number): string => {
  const rounded = Math.round(val);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Formats a number as a currency string with a space separator.
 */
export const formatCurrency = (val: number): string => {
  return `$${formatMoney(val)}`;
};
