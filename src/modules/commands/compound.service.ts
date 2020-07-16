import { Injectable, Scope } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCompoundHandler } from './compound.handler.base';
import { AuthService } from '../auth/auth.service';

@Injectable({
  scope: Scope.DEFAULT,
})
export class CompoundService {
  private _compoundingData: Map<string, BaseCompoundHandler>;
  private handlers: typeof BaseCompoundHandler[] = [BaseCompoundHandler];

  constructor(private auth: AuthService) {
    this._compoundingData = new Map<string, BaseCompoundHandler>([]);
  }
  canCompound(message: Message): boolean {
    return this.handlers.some(h => h.startCommand.test(message.message));
  }

  async startCompound(message: Message): Promise<Message | undefined> {
    const handler = this.handlers.find(function(h) {
      return h.startCommand.test(message.message);
    });
    if (handler.requiresAuth) {
      if (await this.auth.isAuthenticated(message.senderId, message.channel)) {
        this._compoundingData.set(message.senderId, new handler());
        return this.handleCompound(message);
      } else {
        return {
          ...message,
          message: 'You cannot use this command',
        };
      }
    }
    this._compoundingData.set(message.senderId, new handler());
    return this.handleCompound(message);
  }

  async handleCompound(message: Message): Promise<Message | undefined> {
    if (this._compoundingData.has(message.senderId)) {
      const {
        isCompounding,
        message: returnMsg,
      } = await this._compoundingData
        .get(message.senderId)
        .handleInput(message);
      if (!isCompounding) {
        this.finishedCompounding(message.senderId);
      }
      return returnMsg;
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
