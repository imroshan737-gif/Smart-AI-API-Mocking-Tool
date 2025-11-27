import { MockEndpoint } from '../types';

const STORAGE_KEY = 'mockai_endpoints_v1';

// Seed data to show on first load
const SEED_DATA: MockEndpoint[] = [
  {
    id: '1',
    name: 'Get User Profile',
    path: '/api/v1/users/:id',
    method: 'GET' as any,
    description: 'Returns a user profile with sensitive data masked',
    responseBody: {
      id: "user_123",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: "admin",
      tokens: {
        access: "sk_****4252",
        refresh: "rt_****9921"
      }
    },
    delayMs: 200,
    statusCode: 200,
    createdAt: Date.now(),
    tags: ['Users', 'Auth']
  },
  {
    id: '2',
    name: 'Create Order (Error Simulation)',
    path: '/api/v1/orders',
    method: 'POST' as any,
    description: 'Simulates a payment required error',
    responseBody: {
      error: "PaymentRequired",
      message: "Insufficient funds in the wallet.",
      code: 40201
    },
    delayMs: 500,
    statusCode: 402,
    createdAt: Date.now(),
    tags: ['Orders', 'Errors']
  }
];

export const getMocks = (): MockEndpoint[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const getMockById = (id: string): MockEndpoint | undefined => {
  const mocks = getMocks();
  return mocks.find(m => m.id === id);
};

export const saveMock = (mock: MockEndpoint): void => {
  const mocks = getMocks();
  const index = mocks.findIndex(m => m.id === mock.id);
  if (index >= 0) {
    mocks[index] = mock;
  } else {
    mocks.push(mock);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
};

export const deleteMock = (id: string): void => {
  const mocks = getMocks().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
};

export const createNewMock = (): MockEndpoint => ({
  id: crypto.randomUUID(),
  name: 'New Mock Endpoint',
  path: '/api/resource',
  method: 'GET' as any,
  description: '',
  responseBody: { message: "Hello World" },
  delayMs: 0,
  statusCode: 200,
  createdAt: Date.now(),
  tags: []
});