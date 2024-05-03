import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data.affected === 0) {
          return {
            code: 404,
            msg: "Error: Not Found",
            data: null,
          }
        } else {
          return { code: 200, msg: "success", data } // 包装响应数据
        }
      }),
    )
  }
}
