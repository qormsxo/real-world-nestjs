// import {
//     ExceptionFilter,
//     Catch,
//     ArgumentsHost,
//     HttpException,
//   } from '@nestjs/common';
//   import { Request, Response } from 'express';
  
//   @Catch(HttpException)
//   export class HttpExceptionFilter implements ExceptionFilter {
//     catch(exception: HttpException, host: ArgumentsHost) {
//         const context = host.switchToHttp();
//         const response = context.getResponse<Response>();
//         const request = context.getRequest<Request>();

//         const status = exception.getStatus(); // HTTP 상태 코드 가져오기
//         const message = exception.message; // 에러 메시지 가져오기
        
        
//         // 클라이언트에게 응답을 전송
//         response.status(status).json({
//         statusCode: status,
//         message: message || 'Internal server error',
//         timestamp: new Date().toISOString(),
//         path: request.url,
//         });
//     }
//   }
  