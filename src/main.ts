import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { WinstonLogger } from './config/logging/logger';
import { LoggingInterceptor } from './middleware/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './middleware/flters/all-exception.filter';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule,{

  });
  // 글로벌 로깅 설정
  app.useLogger(app.get(WinstonLogger));

  // 전역 예외 필터 등록
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  // 글로벌 인터셉터 등록
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(WinstonLogger)));
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
