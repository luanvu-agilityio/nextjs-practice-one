// Mock the external twilio package (default export) with an attached create mock
jest.mock('twilio', () => {
  const createMock = jest.fn();
  const impl = jest.fn(() => ({ messages: { create: createMock } }));
  // attach the inner create mock so tests can access it via requireMock
  (impl as unknown as { __create?: jest.Mock }).__create = createMock;
  return impl;
});

// Mock local config helper; expose its mock via requireMock later
jest.mock('../config', () => {
  const getConfigMock = jest.fn();
  return { getConfig: getConfigMock };
});

// Import under test after mocks are established
import { getClientFromEnv, sendSms, isTwilioConfigured } from '../twilio';

// retrieve inner mocks exposed by the jest.mock factories
const twilioMock = jest.requireMock('twilio') as jest.Mock & {
  __create?: jest.Mock;
};
const createMock = (twilioMock as unknown as { __create?: jest.Mock })
  .__create as jest.Mock;
const configMod = jest.requireMock('../config') as { getConfig: jest.Mock };
const getConfigMock = configMod.getConfig;

describe('twilio helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getClientFromEnv returns null when account or token missing', () => {
    expect(getClientFromEnv(undefined, 'token')).toBeNull();
    expect(getClientFromEnv('sid', undefined)).toBeNull();
    expect(getClientFromEnv(undefined, undefined)).toBeNull();
  });

  it('getClientFromEnv returns a client when credentials provided', () => {
    const client = getClientFromEnv('SID', 'TOKEN') as unknown as {
      messages: { create: (...args: unknown[]) => unknown };
    };
    expect(client).not.toBeNull();
    expect(typeof client.messages.create).toBe('function');
    expect(twilioMock).toHaveBeenCalledWith('SID', 'TOKEN');
  });

  it('sendSms throws when Twilio not configured', async () => {
    getConfigMock.mockResolvedValueOnce({
      TWILIO_ACCOUNT_SID: undefined,
      TWILIO_AUTH_TOKEN: undefined,
      TWILIO_PHONE_NUMBER: undefined,
    });
    await expect(sendSms('+155555', 'hi')).rejects.toThrow(
      'Twilio not configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN)'
    );
  });

  it('sendSms throws when phone number missing', async () => {
    getConfigMock.mockResolvedValueOnce({
      TWILIO_ACCOUNT_SID: 'A',
      TWILIO_AUTH_TOKEN: 'B',
      TWILIO_PHONE_NUMBER: undefined,
    });
    await expect(sendSms('+155555', 'hi')).rejects.toThrow(
      'TWILIO_PHONE_NUMBER not configured'
    );
  });

  it('sendSms calls client.messages.create with correct args and returns value', async () => {
    const expectedResult = { sid: 'm1' };
    createMock.mockResolvedValueOnce(expectedResult);
    getConfigMock.mockResolvedValueOnce({
      TWILIO_ACCOUNT_SID: 'A',
      TWILIO_AUTH_TOKEN: 'B',
      TWILIO_PHONE_NUMBER: '+1999000',
    });

    const res = await sendSms('+15551234', 'hello');

    expect(createMock).toHaveBeenCalledWith({
      to: '+15551234',
      from: '+1999000',
      body: 'hello',
    });
    expect(res).toBe(expectedResult);
  });

  it('isTwilioConfigured returns boolean based on config', async () => {
    getConfigMock.mockResolvedValueOnce({
      TWILIO_ACCOUNT_SID: 'A',
      TWILIO_AUTH_TOKEN: 'B',
      TWILIO_PHONE_NUMBER: '+1',
    });
    expect(await isTwilioConfigured()).toBe(true);

    getConfigMock.mockResolvedValueOnce({
      TWILIO_ACCOUNT_SID: '',
      TWILIO_AUTH_TOKEN: 'B',
      TWILIO_PHONE_NUMBER: '+1',
    });
    expect(await isTwilioConfigured()).toBe(false);
  });
});
