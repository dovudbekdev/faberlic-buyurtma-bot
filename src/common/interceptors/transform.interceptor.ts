import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const response: Response<T> = {
          success: true,
          timestamp: new Date().toISOString(),
        };

        if (data !== null && data !== undefined) {
          response.data = data;
        } else {
          response.message = 'Operation completed successfully';
        }

        return response;
      }),
    );
  }
}
