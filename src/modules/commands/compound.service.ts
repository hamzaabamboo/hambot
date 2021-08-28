import { Injectable, Scope } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCompoundHandler } from './compound.handler.base';
import { AuthService } from '../auth/auth.service';
import { FileCommand } from './compound/files.command';
import { ModuleRef } from '@nestjs/core';
import { ProfilePicCommand } from './discord/profilepic.command';

@Injectable({
  scope: Scope.DEFAULT,
})
export class CompoundService {
  private _compoundingData: Map<string, BaseCompoundHandler>;
  private handlers: typeof BaseCompoundHandler[] = [
    ProfilePicCommand,
    FileCommand,
    BaseCompoundHandler,
  ];

  constructor(private auth: AuthService, private moduleRef: ModuleRef) {
    this._compoundingData = new Map<string, BaseCompoundHandler>([]);
  }
  canCompound(message: Message): boolean {
    return this.handlers.some((h) => h.startCommand.test(message.message));
  }

  async startCompound(message: Message): Promise<Partial<Message> | undefined> {
    const handler = this.handlers.find(function (h) {
      return h.startCommand.test(message.message);
    });
    if (handler.requiresAuth) {
      if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
        this._compoundingData.set(
          message.senderId,
          new handler(this.moduleRef),
        );
        return this.handleCompound(message);
      } else {
        return {
          files: [],
          message: 'You cannot use this command',
        };
      }
    }
    this._compoundingData.set(message.senderId, new handler(this.moduleRef));
    return this.handleCompound(message);
  }

  async handleCompound(message: Message): Promise<Message | undefined> {
    if (this._compoundingData.has(message.senderId)) {
      const res = await this._compoundingData
        .get(message.senderId)
        .handleInput(message);
      if (!res) {
        this.finishedCompounding(message.senderId);
      }
      const { isCompounding, message: returnMsg } = res;
      if (!isCompounding) {
        this.finishedCompounding(message.senderId);
      }
      return { ...message, ...returnMsg };
    }
    return;
  }

  isCompounding(senderId: string): boolean {
    return this._compoundingData.has(senderId);
  }

  finishedCompounding(senderId: string) {
    this._compoundingData.delete(senderId);
  }
}
