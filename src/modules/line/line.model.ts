export interface LineWebHookMessage {
  destination: string;
  events: LineEvent[];
}
export type LineEvent =
  | LineMessageEvent
  | LineFollowEvent
  | LineUnfollowEvent
  | LineJoinEvent
  | LineLeaveEvent
  | LineMemberJoinEvent
  | LineMemberLeaveEvent
  | LinePostbackEvent
  | LineBeaconEvent
  | LineAccountLinkEvent
  | LineDeviceLinkEvent
  | LineDeviceUnlinkEvent;
//   | LineThingsEvent;

interface BaseLineEvent {
  type: string;
  mode: 'active' | 'standby';
  timestamp: number;
  source: LineSource;
}

export interface LineMessageEvent extends BaseLineEvent {
  type: 'message';
  message: LineMessage;
}

export interface LineFollowEvent extends BaseLineEvent {
  type: 'follow';
  replyToken: string;
}
export interface LineUnfollowEvent extends BaseLineEvent {
  type: 'follow';
  replyToken: string;
}

export interface LineJoinEvent extends BaseLineEvent {
  type: 'join';
  replyToken: string;
}
export interface LineLeaveEvent extends BaseLineEvent {
  type: 'leave';
  replyToken: string;
}
export interface LineMemberJoinEvent extends BaseLineEvent {
  type: 'memberJoined';
  replyToken: string;
  joined: {
    members: LineUser[];
  };
}
export interface LineMemberLeaveEvent extends BaseLineEvent {
  type: 'memberLeft';
  replyToken: string;
  left: {
    members: LineUser[];
  };
}

export interface LinePostbackEvent extends BaseLineEvent {
  type: 'postback';
  replyToken: string;
  postback: {
    data: string;
    params: {
      date: string;
      time: string;
      datetime: string;
    };
  };
}

export interface LineBeaconEvent extends BaseLineEvent {
  type: 'beacon';
  replyToken: string;
  beacon: {
    hwid: string;
    type: 'enter' | 'leave' | 'banner' | 'stay';
    dm: string;
  };
}

export interface LineAccountLinkEvent extends BaseLineEvent {
  type: 'accountLink';
  replyToken: string;
  link: {
    result: 'ok' | 'failed';
    nounce: string;
  };
}

export interface LineDeviceLinkEvent extends BaseLineEvent {
  type: 'things';
  replyToken: string;
  things: {
    deviceId: string;
    type: 'link';
  };
}

export interface LineDeviceUnlinkEvent extends BaseLineEvent {
  type: 'things';
  replyToken: string;
  things: {
    deviceId: string;
    type: 'unlink';
  };
}

export type LineSource = LineUser | LineGroup | LineRoom;
interface BaseLineSource {
  type: string;
  userId: string;
}
export interface LineUser extends BaseLineSource {
  type: 'user';
}
export interface LineGroup extends BaseLineSource {
  type: 'group';
  groupId: string;
}
export interface LineRoom extends BaseLineSource {
  type: 'room';
  roomId: string;
}

export type LineMessage =
  | LineTextMessage
  | LineImageMessage
  | LineVideoMessage
  | LineAudioMessage
  | LineFileMessage
  | LineLocationMessage
  | LineStickerMessage;

interface BaseLineMessage {
  id: string;
  type: string;
}

export interface LineTextMessage extends BaseLineMessage {
  type: 'text';
  text: string;
  emojis: LineEmoji[];
}

export interface LineImageMessage extends BaseLineMessage {
  type: 'image';
  contentProvider: {
    type: 'line' | 'external';
    originalContentUrl: string;
    previewImageUrl: string;
  };
}

export interface LineVideoMessage extends BaseLineMessage {
  type: 'video';
  duration: number;
  contentProvider: {
    type: 'line' | 'external';
    originalContentUrl: string;
    previewImageUrl: string;
  };
}

export interface LineAudioMessage extends BaseLineMessage {
  type: 'audio';
  duration: number;
  contentProvider: {
    type: 'line' | 'external';
    originalContentUrl: string;
  };
}

export interface LineFileMessage extends BaseLineMessage {
  type: 'file';
  fileName: string;
  fileSize: string;
}

export interface LineLocationMessage extends BaseLineMessage {
  type: 'location';
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface LineStickerMessage extends BaseLineMessage {
  type: 'sticker';
  packageId: string;
  stickerId: string;
  stickerResourceType:
    | 'STATIC'
    | 'ANIMATION'
    | 'SOUND'
    | 'ANIMATION_SOUND'
    | 'POPUP'
    | 'POPUP_SOUND'
    | 'NAME_TEXT'
    | 'PER_STICKER_TEXT';
}

export interface LineEmoji {
  index: number;
  length: number;
  productId: string;
  emojiId: string;
}

export type LineSendMessage =
  | LineSendTextMessage
  | LineSendStickerMessage
  | LineSendImageMessage
  | LineSendVideoMessage
  | LineSendAudioMessage
  | LineSendLocationMessage
  | LineSendImagemapMessage
  | LineSendTemplateMessage
  | LineSendFlexMessage;

interface BaseLineSendMessage {
  type: string;
  quickReply: {
    items: {
      type: 'action';
      imageUrl: string;
      action: LineAction;
    }[];
  };
}

export interface LineSendTextMessage extends BaseLineSendMessage {
  type: 'text';
  text: string;
  emojis: LineEmoji[];
}
export interface LineSendStickerMessage extends BaseLineSendMessage {
  type: 'sticker';
  packageId: string;
  stickerId: string;
}
export interface LineSendImageMessage extends BaseLineSendMessage {
  type: 'image';
  orignalContentUrl: string;
  previewImageUrl: string;
}
export interface LineSendVideoMessage extends BaseLineSendMessage {
  type: 'video';
  originalContentUrl: string;
  previewImageUrl: string;
}
export interface LineSendAudioMessage extends BaseLineSendMessage {
  type: 'audio';
  originalContentUrl: string;
  duration: number;
}
export interface LineSendLocationMessage extends BaseLineSendMessage {
  type: 'location';
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}
export interface LineSendImagemapMessage extends BaseLineSendMessage {
  type: 'imagemap';
  baseUrl: string;
  altText: string;
  baseSize: {
    width: number;
    height: number;
  };
  video: {
    originalContentUrl: string;
    previewImageUrl: string;
    area: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
    externalLink: {
      linkUri: string;
      label: string;
    };
  };
  actions: {
    type: 'uri';
    label: string;
    linkUri: string;
    area: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  }[];
}
export interface LineSendTemplateMessage extends BaseLineSendMessage {
  type: 'template';
  altText: string;
  template: LineTemplate;
}

export type LineTemplate =
  | LineButtonsTemplate
  | LineConfirmTemplate
  | LineCarouselTemplate
  | LineImageCarouselTemplate;

export interface LineButtonsTemplate {
  type: 'buttons';
  thumnailImageurl?: string;
  imageApectRatio?: '1.15:1' | '1:1';
  imageSize?: 'cover' | 'contain';
  imageBackgroundColor?: string;
  title?: string;
  defaultAction: LineAction;
  actions: LineAction[];
}

export interface LineConfirmTemplate {
  type: 'confirm';
  text: string;
  actions: LineAction[];
}

export interface LineCarouselTemplate {
  type: 'carousel';
  columns: {
    thumbnailImageUrl?: string;
    imageBackgroundColor?: string;
    title?: string;
    text?: string;
    defaultAction: LineAction;
    actions: LineAction[];
  }[];
  imageApectRatio?: '1.15:1' | '1:1';
  imageSize?: 'cover' | 'contain';
}

export interface LineImageCarouselTemplate {
  typye: 'image_carousel';
  columns: {
    imageUrl: string;
    action: LineAction;
  }[];
}

export interface LineSendFlexMessage extends BaseLineSendMessage {
  type: 'flex';
  altText: string;
  contents: LineFlexMessageContainer;
}

export type LineFlexMessageContainer = LineFlexBubbleMessage | LineFlexCarousel;

export interface LineFlexBubbleMessage {
  type: 'bubble';
  size?: 'nano' | 'micro' | 'kilo' | 'mega' | 'giga';
  direaction?: 'ltr' | 'rtl';
  header: LineFlexBox;
  hero: LineFlexBox | LineFlexImage;
  body: LineFlexBox;
  footer: LineFlexBox;
  styles: {
    header: LineBlockStyle;
    hero: LineBlockStyle;
    body: LineBlockStyle;
    footer: LineBlockStyle;
  };
  action: LineAction;
}
export interface LineFlexCarousel {
  type: 'carousel';
  contents: LineFlexBubbleMessage[];
}
export type LineFlexContent = LineFlexBox | LineFlexButton | LineFlexImage;
//   | LineFlexIcon
//   | LineFlexText;

export interface LineFlexBox {
  type: 'box';
  layout: 'horizontal' | 'vertical' | 'baseline';
  contents: LineFlexContent[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: 'none' | 'light' | 'normal' | 'medium' | 'semi-bold' | 'bold';
  cornerRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  width?: string;
  height?: string;
  flex?: number;
  spacing?: string;
  margin?: string;
  paddingAll?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingStart?: string;
  paddingEnd?: string;
  position: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
  action: LineAction;
}
export interface LineFlexButton {
  type: 'button';
  action: LineAction;
  flex?: number;
  margin?: string;
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
  height?: string;
  style?: 'primary' | 'secondary' | 'link';
  color?: string;
  gravity?: string;
}
export interface LineFlexImage {
  type: 'image';
  flex?: number;
  margin?: string;
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
  align?: string;
  gravity?: string;
  size?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  aspectRatio?: string;
  aspectMode?: string;
  backgroundColor?: string;
  action?: LineAction;
}
export interface LineBlockStyle {
  backgroundColor?: string;
  separator?: boolean;
  separatorColor?: string;
}
export type LineAction = {
  type: string;
  label: string;
  data: string;
};
