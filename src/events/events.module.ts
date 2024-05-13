import { Module } from "@nestjs/common"
import { EventsGateway } from "./events.gateway"
import { WordsService } from "src/words/words.service"

@Module({
  providers: [EventsGateway,WordsService],
})
export class EventsModule {}
