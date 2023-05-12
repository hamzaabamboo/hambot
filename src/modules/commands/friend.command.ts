import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.model';
import { BaseCommand } from './command.base';

@Injectable()
export class FriendCommand extends BaseCommand {
  public command = /^(friend)/i;
  private bestFriends = ['Ham-san', 'หิม', 'Yama', 'Samuraiwarm'];
  private quotes = [
    'ไม่ได้มึงนี่กูแย่เลย',
    'I am not a noodle guy',
    'Mr. {{NAME}}, I saw you at MBK. Are you still there?',
    'นี่มันอะไรกันเนี่ย',
    'Mata mata',
    'วันหลังชวนไปกินหมาล่าด้วยนะ',
  ];

  async handle(message: Message) {
    const selectedIndex = Math.floor(Math.random() * this.quotes.length);
    let selectedQuote = this.quotes[selectedIndex];
    if (selectedIndex === 2) {
      const realBestFriend = this.bestFriends[
        Math.floor(Math.random() * this.bestFriends.length)
      ];
      selectedQuote = selectedQuote.replace('{{NAME}}', realBestFriend);
    }
    return {
      files: [],
      message: selectedQuote,
    };
  }
}
