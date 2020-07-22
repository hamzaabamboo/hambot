import { Controller, Get, Query } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { AppLogger } from '../logger/logger';
@Controller('discord')
export class DiscordController {
  constructor(private service: DiscordService, private logger: AppLogger) {
    this.logger.setContext('DiscordContext');
  }

  @Get('/activate')
  activate(@Query('token') token: string) {
    return this.service.activate(token);
  }
}
