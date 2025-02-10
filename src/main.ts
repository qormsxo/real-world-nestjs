import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { WinstonLogger } from './config/logging/logger';
import { LoggingInterceptor } from './middleware/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './middleware/flters/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule,{

  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // 전달되지 않은 속성 제거
    forbidNonWhitelisted: true, // 유효하지 않은 속성이 있으면 오류 발생
    transform: true,  // 쿼리, 파라미터, 바디 등을 DTO로 자동 변환
    disableErrorMessages: false,  // 에러 메시지 보이기
  }));

  // 글로벌 로깅 설정
  app.useLogger(app.get(WinstonLogger));

  // 전역 예외 필터 등록
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  // 글로벌 인터셉터 등록
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(WinstonLogger)));
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
