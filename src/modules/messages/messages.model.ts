interface BaseMessage {
  channel: string;
  message: string;
}
export interface LineMessage {
  channel: 'line';
  message: string;
  replyToken: string;
}

export type Message = LineMessage;
