import { Injectable } from '@nestjs/common';
import { TrelloService } from '../trello/trello.service';
import moment = require('moment');
import { AppLogger } from '../logger/logger';

@Injectable()
export class AuthService {
  private _cache: { timestamp: number; data: string[] };
  private _userList: any;
  private _authenticating: Map<string, string> = new Map();

  constructor(private trello: TrelloService, private logger: AppLogger) {
    this.logger.setContext('AuthService');
    this.getAuthenticationData();
  }

  async getList() {
    if (this._userList) return this._userList;
    const board = (await this.trello.getBoards()).find(
      b => b.name === 'HamBot',
    );
    const list = (await this.trello.getLists(board.id)).find(
      l => l.name === 'users',
    );
    this._userList = list;
    return this._userList;
  }

  async getAuthenticationData() {
    const list = await this.getList();
    const users = (await this.trello.getCards(list.id)).map(e => e.name);
    this._cache = { timestamp: new Date().valueOf(), data: users };
  }

  async isAuthenticated(senderId: string, channel: string): Promise<boolean> {
    if (!this._cache || moment().diff(this._cache.timestamp, 'm') > 2) {
      this.logger.verbose('Cache empty fetching user data');
      await this.getAuthenticationData();
    }
    console.log('checkla');
    return this._cache.data.includes(`${channel}: ${senderId}`);
  }

  getToken(senderId: string, channel: string): string {
    const token = Math.floor(Math.random() * 10000000000000).toString();
    this._authenticating.set(`${channel}: ${senderId}`, token);
    return token;
  }

  async register(
    senderId: string,
    channel: string,
    token: string,
  ): Promise<boolean> {
    if (!this._authenticating.has(`${channel}: ${senderId}`)) return false;
    if (this._authenticating.get(`${channel}: ${senderId}`) === token) {
      const list = await this.getList();
      await this.trello.addCard(list.id, `${channel}: ${senderId}`);
      this._cache.data.push(`${channel}: ${senderId}`);
      return true;
    }
  }
}
