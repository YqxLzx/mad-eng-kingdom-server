import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { WsAdapter } from "@nestjs/platform-ws"


async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.useWebSocketAdapter(new WsAdapter(app))
  await app.listen(3000)
  console.log('\x1b[36m', `Application is running on: ${await app.getUrl()}`,'\x1b[0m')
}
bootstrap()
