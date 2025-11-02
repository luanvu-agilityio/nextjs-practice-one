import { NextRequest } from 'next/server';

import { POST, PUT } from '../route';
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
      const response = await POST(request);
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

      const response = await POST(request);
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

      const response = await POST(request);
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

      const response = await POST(request);
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

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error');
    });
  });

  describe('PUT /api/sms-2fa', () => {
    it('should return 400 if phone or code is missing', async () => {
      const request = createMockRequest({ phone: '+1234567890' });
      const response = await PUT(request);
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

      const response = await PUT(request);
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

      const response = await PUT(request);
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

      const response = await PUT(request);
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

      const response = await PUT(request);
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

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error');
    });
  });
});
