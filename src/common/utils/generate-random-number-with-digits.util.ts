export default function generateRandomNumberWithDigits(
  digitCount: number,
): string {
  const max = Math.pow(10, digitCount) - 1;
  const randomNumber = Math.floor(Math.random() * (max + 1));

  return randomNumber.toString().padStart(digitCount, '0');
}
