import { Request, Response } from 'express';

export interface UserRequest extends Request {
  userData: {
    id: number;
    username: string;
    userType: string;
  };
}
