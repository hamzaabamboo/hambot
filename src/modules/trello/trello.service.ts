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

  async getLists(boardId: string) {
    return await this.client.getListsOnBoard(boardId);
  }

  async getCards(listId: string): Promise<any[]> {
    return await this.client.getCardsOnList(listId);
  }

  async addCard(listId: string, title: string, description?: string) {
    return await this.client.addCard(title, description, listId);
  }

  async deleteCard(cardId: string) {
    return await this.client.deleteCard(cardId);
  }
  async editCard(
    cardId: string,
    title?: string,
    description?: string,
    listId?: string,
  ) {
    if (title) await this.client.updateCardName(cardId, title);
    if (description)
      await this.client.updateCardDescription(cardId, description);
    if (listId) await this.client.updateCardList(cardId, listId);
    return;
  }
}
