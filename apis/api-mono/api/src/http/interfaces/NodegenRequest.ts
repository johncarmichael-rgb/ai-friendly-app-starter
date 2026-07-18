import express from 'express';
import { SessionData } from '@/services/SessionService';

declare global {
  namespace Express {
    export interface Request {
      jwtData: any;
      originalToken: string;
      clientIp?: string;

      // sessionData is populated by SessionMiddleware from the session cookie
      sessionData: SessionData
    }
  }
}

type NodegenRequest = express.Request;
export default NodegenRequest;
