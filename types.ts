export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export interface MockEndpoint {
  id: string;
  name: string;
  path: string;
  method: HttpMethod;
  description?: string;
  responseBody: any;
  delayMs: number;
  statusCode: number;
  createdAt: number;
  tags: string[];
}

export interface SimulationResult {
  status: number;
  data: any;
  headers: Record<string, string>;
  duration: number;
  timestamp: string;
}

export type MockGeneratorInput = {
  inputMode: 'swagger' | 'description' | 'raw';
  content: string;
}