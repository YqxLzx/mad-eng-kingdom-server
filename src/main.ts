import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { WsAdapter } from "@nestjs/platform-ws"
//import { getWords } from "./utils/getWords"
//import { getAccessTokenForBaidu } from "./utils"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  //getWords()
  //getAccessTokenForBaidu()
  app.enableCors()
  app.useWebSocketAdapter(new WsAdapter(app))
  await app.listen(3000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
