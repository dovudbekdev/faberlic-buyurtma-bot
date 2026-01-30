import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodeType } from './error-codes';

/**
 * AppException - xatolikni qayarish uchun maxsus class
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCodeType,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super({ code, details }, status);
  }
}
