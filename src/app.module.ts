import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { TransformResponseInterceptor } from "./Interceptor/transform-response.interceptor"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { JwtStrategy } from "./authGuard/jwt.strategy"
import { APP_GUARD } from "@nestjs/core"
import { JwtAuthGuard } from "./authGuard/jwt.auth.guard"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./users/users.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { StsController } from "./sts/sts.controller"
import { EventsModule } from "./events/events.module"
import { WordsModule } from "./words/words.module"
import { FileModule } from "./file/file.module"
import * as cors from "cors" // 引入 cors 模块

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: "lzxlzx", // replace with your secret key
      signOptions: { expiresIn: "60m" },
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "106.52.221.140",
      port: 3306,
      username: "new_schema",
      password: "lzx125lzx",
      database: "new_schema",
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    EventsModule,
    WordsModule,
    FileModule,
  ],
  controllers: [AppController, StsController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes("*") // 对所有路由应用 CORS 中间件
  }
}
