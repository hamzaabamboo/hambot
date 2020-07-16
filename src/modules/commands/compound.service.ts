import { Injectable, Scope } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCompoundHandler } from './compound.handler.base';

@Injectable({
  scope: Scope.DEFAULT,
})
export class CompoundService {
  private _compoundingData: Map<string, BaseCompoundHandler>;
  private handlers: typeof BaseCompoundHandler[] = [BaseCompoundHandler];

  constructor() {
    this._compoundingData = new Map<string, BaseCompoundHandler>([]);
  }
  canCompound(message: Message): boolean {
    return this.handlers.some(h => h.startCommand.test(message.message));
  }

  startCompound(message: Message): Promise<Message | undefined> {
    const handler = this.handlers.find(function(h) {
      return h.startCommand.test(message.message);
    });
    this._compoundingData = this._compoundingData.set(
      message.senderId,
      new handler(),
    );
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
