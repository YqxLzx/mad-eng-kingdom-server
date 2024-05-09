import { Module } from "@nestjs/common"
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
import { Word } from "./words/word.entity"


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: "lzxlzx", // replace with your secret key
      signOptions: { expiresIn: "60m" },
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "lzx125lzx",
      database: "new_schema",
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forRootAsync({  
      name: 'wnProConnection', // 与 forFeature 中的名称匹配  
      useFactory: () => ({  
        type: 'mysql',  
        host: 'localhost',  
        port: 3306,  
        username: 'root',  
        password: 'lzx125lzx',  
        database: 'wn_pro_mysql', // 你的 wn_pro_mysql 数据库名  
        entities: [Word], // 这里不需要添加 WnSynset，因为已经在 WordsModule 的 forFeature 中指定了  
        synchronize: true,
        logging: true // 注意：生产环境中应该关闭这个选项  
      }),  
    }),
    UsersModule,
    EventsModule,
    WordsModule,

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
export class AppModule {

}
