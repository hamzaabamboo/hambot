import {
  Controller,
  Get,
  Query,
  HttpException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { DiscordService } from './discord.service';
import { AppLogger } from '../logger/logger';
import { generateRandomKey } from 'src/utils';
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
