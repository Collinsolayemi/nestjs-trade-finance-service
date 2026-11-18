import * as moment from 'moment-timezone';
import { MixedPaymentDto } from 'src/modules/letter-of-credit/dto/mixed-payment.dto';

export default function formatPaymentDetails(
  mixedPaymentDetails: MixedPaymentDto[],
  maxLines = 4,
  maxCharsPerLine = 33,
) {
  const lines = [];

  mixedPaymentDetails.forEach((payment) => {
    if (lines.length >= maxLines) return;

    const date = moment(payment.paymentDate).format('D MMMM, YYYY');

    const amount = (payment.paymentAmount / 100).toFixed(2);

    const method = payment.paymentMethod;

    const parts = [date, amount, method];
    let currentLine = '';

    parts.forEach((part, index) => {
      const separator = index === 0 ? '' : ', ';
      const testLine = currentLine + separator + part;

      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine && lines.length < maxLines) {
          lines.push(currentLine);
        }

        if (lines.length < maxLines) {
          currentLine = part.substring(0, maxCharsPerLine);
        }
      }
    });

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
  });

  return lines.join('\r\n');
}
