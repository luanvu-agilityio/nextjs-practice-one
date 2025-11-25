import twilio from 'twilio';
import { getConfig } from './config';

// Keep `fromPhone` empty at module load time; resolved at runtime via `getConfig()`.
let fromPhone = '';

export function getClientFromEnv(
  accountSid: string | undefined,
  authToken: string | undefined
) {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

export async function sendSms(to: string, body: string) {
  const cfg = await getConfig();
  const client = getClientFromEnv(
    cfg.TWILIO_ACCOUNT_SID,
    cfg.TWILIO_AUTH_TOKEN
  );
  if (!client) {
    throw new Error(
      'Twilio not configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN)'
    );
  }
  fromPhone = cfg.TWILIO_PHONE_NUMBER || '';
  if (!fromPhone) {
    throw new Error('TWILIO_PHONE_NUMBER not configured');
  }
  return client.messages.create({ to, from: fromPhone, body });
}

export async function isTwilioConfigured() {
  const cfg = await getConfig();
  return (
    !!cfg.TWILIO_ACCOUNT_SID &&
    !!cfg.TWILIO_AUTH_TOKEN &&
    !!cfg.TWILIO_PHONE_NUMBER
  );
}
