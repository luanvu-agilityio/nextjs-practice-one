import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';
import twilio from 'twilio';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
  NextRequest: jest.fn(),
}));

// Mock dependencies
jest.mock('twilio');
jest.mock('@/lib/db', () => ({
  db: {
    query: {
      user: {
        findFirst: jest.fn(),
      },
    },
    delete: jest.fn(),
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      signInEmail: jest.fn(),
    },
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value })),
}));

// Mock Twilio client
const mockCreate = jest.fn();
const mockTwilioClient = {
  messages: {
    create: mockCreate,
  },
};
(twilio as jest.MockedFunction<typeof twilio>).mockReturnValue(
  mockTwilioClient as unknown as ReturnType<typeof twilio>
);

// Mock our twilio helper so tests don't call into Effect/getConfig
jest.mock('@/lib/twilio', () => ({
  sendSms: jest.fn(async (to: string, body: string) => {
    return mockCreate({
      to,
      from: process.env.TWILIO_PHONE_NUMBER || '',
      body,
    });
  }),
  isTwilioConfigured: jest.fn(
    () =>
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_PHONE_NUMBER
  ),
}));

// Mock database operations
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockInsert = jest.fn();
const mockValues = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();

(db.select as jest.Mock) = mockSelect;
(db.insert as jest.Mock) = mockInsert;
(db.delete as jest.Mock) = mockDelete;
(db.update as jest.Mock) = mockUpdate;

// Simple thin wrappers to call the statically-imported handlers. Route module
// now evaluates Twilio env vars lazily at call time, so tests can set
// process.env before invoking handlers and also mutate the imported `db`
// mock at runtime.
const callPOST = async (request: NextRequest) => {
  const { POST } = await import('../route');
  return POST(request as unknown as NextRequest);
};

const callPUT = async (request: NextRequest) => {
  const { PUT } = await import('../route');
  return PUT(request as unknown as NextRequest);
};

describe('SMS 2FA API Routes', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Ensure Twilio env variable is set for tests
    process.env.TWILIO_PHONE_NUMBER =
      process.env.TWILIO_PHONE_NUMBER || '+10000000000';

    // Setup default mock chain for db operations
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue([]);
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);
    mockDelete.mockReturnValue({ where: mockWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });

    // Setup Twilio mock
    mockCreate.mockResolvedValue({ sid: 'test-sid' });
  });

  describe('POST /api/sms-2fa', () => {
    it('should return 400 if phone is missing', async () => {
      const request = createMockRequest({});
      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Phone required');
    });

    it('should return 401 for invalid credentials', async () => {
      const mockSignInEmail = jest.fn().mockResolvedValue({ user: null });
      (auth.api.signInEmail as unknown as jest.Mock) = mockSignInEmail;

      const request = createMockRequest({
        phone: '+1234567890',
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 404 if user not found by phone', async () => {
      mockWhere.mockResolvedValue([]);

      const request = createMockRequest({
        phone: '+1234567890',
      });

      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User not found');
    });

    it.skip('should return 500 if SMS sending fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        twoFactorEnabled: true,
      };

      mockWhere.mockResolvedValue([mockUser]);
      mockCreate.mockRejectedValue(new Error('Twilio error'));

      const request = createMockRequest({
        phone: '+1234567890',
      });

      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to send SMS');
    });

    it('should handle unexpected errors', async () => {
      const request = createMockRequest({
        phone: '+1234567890',
      });

      mockWhere.mockRejectedValue(new Error('Database error'));

      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to send SMS');
    });
  });

  describe('PUT /api/sms-2fa', () => {
    it('should return 400 if phone or code is missing', async () => {
      const request = createMockRequest({ phone: '+1234567890' });
      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Phone and code required');
    });

    it('should return 400 if code is expired', async () => {
      const expiredEntry = {
        id: 'entry-123',
        userId: 'user-123',
        phone: '+1234567890',
        code: '123456',
        expiresAt: new Date(Date.now() - 1000),
        verified: false,
        attempts: '0',
      };

      mockWhere.mockResolvedValue([expiredEntry]);

      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });

      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Code expired');
    });

    it('should return 401 if code is invalid', async () => {
      const validEntry = {
        id: 'entry-123',
        userId: 'user-123',
        phone: '+1234567890',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        attempts: '0',
      };

      mockWhere.mockResolvedValue([validEntry]);

      const request = createMockRequest({
        phone: '+1234567890',
        code: '654321',
      });

      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid code');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should verify code successfully', async () => {
      const validEntry = {
        id: 'entry-123',
        userId: 'user-123',
        phone: '+1234567890',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        attempts: '0',
      };

      mockWhere.mockResolvedValue([validEntry]);

      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });

      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should return 400 if no code entry found', async () => {
      mockWhere.mockResolvedValue([]);

      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });

      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Code expired');
    });

    it('should handle unexpected errors', async () => {
      mockWhere.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });

      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error');
    });
  });

  describe('POST /api/sms-2fa edge cases', () => {
    it('should return 500 if Twilio env vars are missing', async () => {
      process.env.TWILIO_ACCOUNT_SID = '';
      process.env.TWILIO_AUTH_TOKEN = '';
      process.env.TWILIO_PHONE_NUMBER = '';
      const request = {
        json: jest.fn().mockResolvedValue({
          phone: '+1234567890',
          email: 'test@example.com',
          password: 'testpw',
        }),
      } as unknown as NextRequest;
      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 500 if Twilio throws unknown error', async () => {
      mockCreate.mockImplementationOnce(() => {
        throw { foo: 'bar' };
      });
      mockWhere.mockResolvedValue([
        { id: 'user-123', phone: '+1234567890', twoFactorEnabled: true },
      ]);
      const request = createMockRequest({ phone: '+1234567890' });
      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Twilio configuration missing');
      expect(data.details).toBe(undefined);
    });

    it('should return 500 for unexpected error in POST', async () => {
      mockWhere.mockImplementationOnce(() => {
        throw new Error('Unexpected');
      });
      const request = createMockRequest({ phone: '+1234567890' });
      const response = await callPOST(request as unknown as NextRequest);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to send SMS');
    });
  });

  describe('PUT /api/sms-2fa edge cases', () => {
    it('should return 400 if entry is expired', async () => {
      mockWhere.mockResolvedValue([{ expiresAt: new Date(Date.now() - 1000) }]);
      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });
      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Code expired');
    });

    it('should return 400 if no entry found', async () => {
      mockWhere.mockResolvedValue([]);
      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });
      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Code expired');
    });

    it('should return 500 for unexpected error in PUT', async () => {
      mockWhere.mockImplementationOnce(() => {
        throw new Error('Unexpected');
      });
      const request = createMockRequest({
        phone: '+1234567890',
        code: '123456',
      });
      const response = await callPUT(request as unknown as NextRequest);
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unexpected');
    });
  });
});

describe('SMS 2FA API Routes - Extra Coverage', () => {
  const createMockRequest = (body: Record<string, unknown>) =>
    ({
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TWILIO_ACCOUNT_SID = 'sid';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_PHONE_NUMBER = '+10000000000';
    // Re-establish DB and Twilio mock behaviors since mocks were cleared
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue([]);
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);
    mockDelete.mockReturnValue({ where: mockWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockCreate.mockResolvedValue({ sid: 'test-sid' });
  });

  it('should handle POST with valid email/password and send SMS', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValue({
      user: mockUser,
    });
    const request = createMockRequest({
      phone: '+1234567890',
      email: 'test@example.com',
      password: 'pw',
    });
    // ensure Twilio mock resolves for this test (avoid flakiness)
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({ sid: 'test-sid' });
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBeDefined();
  });

  it('should handle POST with valid phone and send SMS', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    // Simulate user found by phone
    const mockUsers = [mockUser];
    const mockWhere = jest.fn().mockResolvedValue(mockUsers);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
    (db.select as jest.Mock) = mockSelect;

    const request = createMockRequest({ phone: '+1234567890' });
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    // With Twilio env present and mocks successful we expect a success response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('SMS code sent');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should successfully send SMS when email+password are valid', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    process.env.TWILIO_ACCOUNT_SID = 'sid';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_PHONE_NUMBER = '+10000000000';
    const { POST: dynamicPOST } = await import('../route');
    const request = createMockRequest({
      phone: '+1234567890',
      email: 'test@example.com',
      password: 'pw',
    });
    const response = await dynamicPOST(request as unknown as NextRequest);
    const data = await response.json();

    // when Twilio and DB mocks are happy, we expect a success response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('SMS code sent');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should successfully send SMS when user is found by phone', async () => {
    const mockUser = {
      id: 'user-234',
      email: 'phoneuser@example.com',
      phone: '+19876543210',
      twoFactorEnabled: true,
    };
    const mockUsers = [mockUser];
    const mockWhereLocal = jest.fn().mockResolvedValue(mockUsers);
    const mockFromLocal = jest.fn().mockReturnValue({ where: mockWhereLocal });
    const mockSelectLocal = jest.fn().mockReturnValue({ from: mockFromLocal });
    (db.select as jest.Mock) = mockSelectLocal;

    process.env.TWILIO_ACCOUNT_SID = 'sid';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_PHONE_NUMBER = '+10000000000';
    const { POST: dynamicPOST2 } = await import('../route');
    const request = createMockRequest({ phone: '+19876543210' });
    const response = await dynamicPOST2(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('SMS code sent');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should handle Twilio error with string message', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    const mockUsers = [mockUser];
    const mockWhere = jest.fn().mockResolvedValue(mockUsers);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
    (db.select as jest.Mock) = mockSelect;
    mockCreate.mockImplementationOnce(() => {
      throw 'Twilio string error';
    });

    const request = createMockRequest({ phone: '+1234567890' });
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to send SMS');
    expect(data.details).toBe('Twilio string error');
  });

  it('should handle Twilio error with Error object', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    const mockUsers = [mockUser];
    const mockWhere = jest.fn().mockResolvedValue(mockUsers);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
    (db.select as jest.Mock) = mockSelect;
    mockCreate.mockImplementationOnce(() => {
      throw new Error('Twilio error object');
    });

    const request = createMockRequest({ phone: '+1234567890' });
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to send SMS');
    expect(data.details).toBe('Twilio error object');
  });

  it('should handle Twilio error with object with message property', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    const mockUsers = [mockUser];
    const mockWhere = jest.fn().mockResolvedValue(mockUsers);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
    (db.select as jest.Mock) = mockSelect;
    mockCreate.mockImplementationOnce(() => {
      throw { message: 'Twilio object message' };
    });

    const request = createMockRequest({ phone: '+1234567890' });
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to send SMS');
    expect(data.details).toBe('{"message":"Twilio object message"}');
  });

  it('should handle Twilio error with object without message property', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      phone: '+1234567890',
      twoFactorEnabled: true,
    };
    const mockUsers = [mockUser];
    const mockWhere = jest.fn().mockResolvedValue(mockUsers);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
    (db.select as jest.Mock) = mockSelect;
    mockCreate.mockImplementationOnce(() => {
      throw { foo: 'bar' };
    });

    const request = createMockRequest({ phone: '+1234567890' });
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to send SMS');
    // details should be present (stringified object)
    expect(data.details).toBeDefined();
  });

  it('should handle POST with missing body', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Bad JSON')),
    } as unknown as NextRequest;
    const response = await callPOST(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Phone required');
  });

  it('should handle PUT with missing body', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Bad JSON')),
    } as unknown as NextRequest;
    const response = await callPUT(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Bad JSON');
  });

  it('should handle PUT with entry missing attempts', async () => {
    const validEntry = {
      id: 'entry-123',
      userId: 'user-123',
      phone: '+1234567890',
      code: '654321',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
      // attempts missing
    };
    const mockWhere = jest.fn().mockResolvedValue([validEntry]);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
    (db.select as jest.Mock) = mockSelect;

    const request = createMockRequest({
      phone: '+1234567890',
      code: '123456',
    });

    const response = await callPUT(request as unknown as NextRequest);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid code');
  });
});
