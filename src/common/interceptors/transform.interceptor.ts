import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是 { code, message, data } 格式，直接返回
        if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
          return data;
        }
        return {
          code: 200,
          message: 'success',
          data,
        };
      }),
    );
  }
}
