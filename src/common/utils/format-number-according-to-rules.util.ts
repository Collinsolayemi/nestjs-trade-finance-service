import { CurrencyDecimalPlacesEnum } from '../enums';

export default function formatNumberAccordingToRules(
  amount: number,
  currencyCode: string,
) {
  // Ensure the provided currency code exists in the mapping
  const allowedDecimalPlaces = CurrencyDecimalPlacesEnum[currencyCode];

  if (typeof allowedDecimalPlaces === 'undefined') {
    throw new Error(
      `Currency ${currencyCode} is not supported for SWIFT Message Format yet.`,
    );
  }

  // Remove any non-digit and non-period characters
  const value = amount.toString().replace(/[^\d.]/g, '');

  // Ensure the number starts with a digit
  if (!/^\d/.test(value)) {
    throw new Error('The amount must start with a digit.');
  }

  // Split by the period (.) which is the default decimal separator in input
  const parts = value.split('.');
  if (parts.length > 2) {
    throw new Error('The amount must contain only one decimal separator.');
  }

  // Handle the decimal part based on the currency's allowed decimal places
  if (parts.length === 1) {
    // If no decimal part exists, add the necessary zeros for allowed decimal places
    parts.push('0'.repeat(allowedDecimalPlaces));
  } else if (parts[1].length < allowedDecimalPlaces) {
    // If the decimal part is shorter than the allowed, pad with zeros
    parts[1] = parts[1].padEnd(allowedDecimalPlaces, '0');
  } else if (parts[1].length > allowedDecimalPlaces) {
    // If the decimal part is longer than the allowed, truncate it
    parts[1] = parts[1].substring(0, allowedDecimalPlaces);
  }

  // Join the whole and decimal parts with a comma as the separator
  const formattedNumber = parts.join(',');

  // Ensure the formatted number contains exactly one comma (as the decimal separator)
  const commaCount = (formattedNumber.match(/,/g) || []).length;
  if (commaCount !== 1) {
    throw new Error(
      'The amount must contain exactly one decimal separator, which is a comma.',
    );
  }

  return formattedNumber;
}
