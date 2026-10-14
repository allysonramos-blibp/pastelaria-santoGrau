/**
 * Utility to generate standard Brazilian PIX EMV (BR Code) string
 * Compatible with all Brazilian banks (Nubank, Inter, Itaú, Santander, BB, Mercado Pago, etc.)
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity?: string;
  amount: number;
  txId?: string;
}

export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity = 'SAO PAULO',
  amount,
  txId = '***',
}: PixPayloadParams): string {
  const cleanKey = pixKey.trim();
  const cleanName = merchantName.slice(0, 25).trim() || 'SANTO GRAU';
  const cleanCity = merchantCity.slice(0, 15).trim() || 'SAO PAULO';
  const cleanTxId = (txId || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';
  const formattedAmount = amount.toFixed(2);

  // 26: Merchant Account Information
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${keyField}`);

  // 52: Merchant Category Code (0000 = default)
  const mcc = formatField('52', '0000');

  // 53: Transaction Currency (986 = BRL)
  const currency = formatField('53', '986');

  // 54: Transaction Amount
  const amountField = formatField('54', formattedAmount);

  // 58: Country Code (BR)
  const country = formatField('58', 'BR');

  // 59: Merchant Name
  const nameField = formatField('59', cleanName);

  // 60: Merchant City
  const cityField = formatField('60', cleanCity);

  // 62: Additional Data Field Template (txId)
  const txField = formatField('05', cleanTxId);
  const additionalData = formatField('62', txField);

  // Payload without CRC
  const rawPayload = `000201${merchantAccountInfo}${mcc}${currency}${amountField}${country}${nameField}${cityField}${additionalData}6304`;

  // Append CRC16
  const checksum = crc16(rawPayload);
  return `${rawPayload}${checksum}`;
}
