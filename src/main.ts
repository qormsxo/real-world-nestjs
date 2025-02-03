import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { WinstonLogger } from './config/logging/logger';
import { LoggingInterceptor } from './middleware/interceptors/logging.interceptor';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule,{

  });

  // 글로벌 로깅 설정
  app.useLogger(app.get(WinstonLogger));

  // 글로벌 인터셉터 등록
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(WinstonLogger)));
  // 기본 로깅을 비활성화(선택 사항)
  app.useLogger(new WinstonLogger());
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
