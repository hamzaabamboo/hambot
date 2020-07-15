import { Injectable } from '@nestjs/common';
import * as Trello from 'trello';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TrelloService {
  private client: Trello;
  constructor(config: ConfigService) {
    this.client = new Trello(
      config.get('TRELLO_API_KEY'),
      config.get('TRELLO_OAUTH_TOKEN'),
    );
  }

  async getBoards() {
    return await this.client.getBoards('me');
  }

  async getLists(boardid: string) {
    return await this.client.getListsOnBoard(boardid);
  }

  async getCards(listid: string): Promise<any[]> {
    return await this.client.getCardsOnList(listid);
  }
}
