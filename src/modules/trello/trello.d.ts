declare module 'trello' {
  type TrelloCallback<T> = (error: Error | null, result: T) => void;
  interface TrelloExtraParams {
    [name: string]: string | number | boolean;
  }

  export default class Trello {
    constructor(key: string, token: string);

    makeRequest(
      requestMethod: string,
      path: string,
      query: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    makeRequest(
      requestMethod: string,
      path: string,
      query: TrelloExtraParams,
    ): Promise<any>;

    addBoard(
      name: string,
      description: string,
      organizationId: string,
      callback: TrelloCallback<any>,
    ): void;
    addBoard(
      name: string,
      description: string,
      organizationId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addBoard(
      name: string,
      description: string,
      organizationId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateBoardPref(
      boardId: string,
      field: string,
      value: string,
      callback: TrelloCallback<any>,
    ): void;
    updateBoardPref(
      boardId: string,
      field: string,
      value: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateBoardPref(
      boardId: string,
      field: string,
      value: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addCard(
      name: string,
      description: string,
      listId: string,
      callback: TrelloCallback<any>,
    ): void;
    addCard(
      name: string,
      description: string,
      listId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addCard(
      name: string,
      description: string,
      listId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addCardWithExtraParams(
      name: string,
      extraParams: TrelloExtraParams,
      listId: string,
      callback: TrelloCallback<any>,
    ): void;
    addCardWithExtraParams(
      name: string,
      extraParams: TrelloExtraParams,
      listId: string,
    ): Promise<any>;

    getCard(
      boardId: string,
      cardId: string,
      callback: TrelloCallback<any>,
    ): void;
    getCard(
      boardId: string,
      cardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getCard(
      boardId: string,
      cardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getCardsForList(
      listId: string,
      actions: string | undefined,
      callback: TrelloCallback<Card[]>,
    ): void;
    getCardsForList(
      listId: string,
      actions: string | undefined,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<Card[]>,
    ): void;
    getCardsForList(
      listId: string,
      actions: string | undefined,
      extraParams?: TrelloExtraParams,
    ): Promise<Card[]>;

    renameList(
      listId: string,
      name: string,
      callback: TrelloCallback<any>,
    ): void;
    renameList(
      listId: string,
      name: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    renameList(
      listId: string,
      name: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addListToBoard(
      boardId: string,
      name: string,
      callback: TrelloCallback<any>,
    ): void;
    addListToBoard(
      boardId: string,
      name: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addListToBoard(
      boardId: string,
      name: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addMemberToBoard(
      boardId: string,
      memberId: string,
      type: string,
      callback: TrelloCallback<any>,
    ): void;
    addMemberToBoard(
      boardId: string,
      memberId: string,
      type: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addMemberToBoard(
      boardId: string,
      memberId: string,
      type: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addCommentToCard(
      cardId: string,
      comment: string,
      callback: TrelloCallback<any>,
    ): void;
    addCommentToCard(
      cardId: string,
      comment: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addCommentToCard(
      cardId: string,
      comment: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addAttachmentToCard(
      cardId: string,
      url: string,
      callback: TrelloCallback<any>,
    ): void;
    addAttachmentToCard(
      cardId: string,
      url: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addAttachmentToCard(
      cardId: string,
      url: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addMemberToCard(
      cardId: string,
      memberId: string,
      callback: TrelloCallback<any>,
    ): void;
    addMemberToCard(
      cardId: string,
      memberId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addMemberToCard(
      cardId: string,
      memberId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getBoards(memberId: string, callback: TrelloCallback<Board[]>): void;
    getBoards(
      memberId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<Board[]>,
    ): void;
    getBoards(
      memberId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<Board[]>;

    getOrgBoards(
      organizationId: string,
      callback: TrelloCallback<Board[]>,
    ): void;
    getOrgBoards(
      organizationId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<Board[]>,
    ): void;
    getOrgBoards(
      organizationId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<Board[]>;

    addChecklistToCard(
      cardId: string,
      name: string,
      callback: TrelloCallback<any>,
    ): void;
    addChecklistToCard(
      cardId: string,
      name: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addChecklistToCard(
      cardId: string,
      name: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addExistingChecklistToCard(
      cardId: string,
      checklistId: string,
      callback: TrelloCallback<any>,
    ): void;
    addExistingChecklistToCard(
      cardId: string,
      checklistId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addExistingChecklistToCard(
      cardId: string,
      checklistId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getChecklistsOnCard(cardId: string, callback: TrelloCallback<any>): void;
    getChecklistsOnCard(
      cardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getChecklistsOnCard(
      cardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addItemToChecklist(
      checklistId: string,
      name: string,
      pos: string,
      callback: TrelloCallback<any>,
    ): void;
    addItemToChecklist(
      checklistId: string,
      name: string,
      pos: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addItemToChecklist(
      checklistId: string,
      name: string,
      pos: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateCard(
      cardId: string,
      field: string,
      value: string,
      callback: TrelloCallback<any>,
    ): void;
    updateCard(
      cardId: string,
      field: string,
      value: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateCard(
      cardId: string,
      field: string,
      value: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateChecklist(
      checklistId: string,
      field: string,
      value: string,
      callback: TrelloCallback<any>,
    ): void;
    updateChecklist(
      checklistId: string,
      field: string,
      value: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateChecklist(
      checklistId: string,
      field: string,
      value: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateCardName(
      cardId: string,
      name: string,
      callback: TrelloCallback<any>,
    ): void;
    updateCardName(
      cardId: string,
      name: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateCardName(
      cardId: string,
      name: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateCardDescription(
      cardId: string,
      description: string,
      callback: TrelloCallback<any>,
    ): void;
    updateCardDescription(
      cardId: string,
      description: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateCardDescription(
      cardId: string,
      description: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateCardList(
      cardId: string,
      listId: string,
      callback: TrelloCallback<any>,
    ): void;
    updateCardList(
      cardId: string,
      listId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateCardList(
      cardId: string,
      listId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getMember(memberId: string, callback: TrelloCallback<any>): void;
    getMember(
      memberId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getMember(memberId: string, extraParams?: TrelloExtraParams): Promise<any>;

    getMemberCards(memberId: string, callback: TrelloCallback<any>): void;
    getMemberCards(
      memberId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getMemberCards(
      memberId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getBoardMembers(boardId: string, callback: TrelloCallback<any>): void;
    getBoardMembers(
      boardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getBoardMembers(
      boardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getOrgMembers(organizationId: string, callback: TrelloCallback<any>): void;
    getOrgMembers(
      organizationId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getOrgMembers(
      organizationId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getListsOnBoard(boardId: string, callback: TrelloCallback<List[]>): void;
    getListsOnBoard(
      boardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<List[]>,
    ): void;
    getListsOnBoard(
      boardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<List[]>;

    getListsOnBoardByFilter(
      boardId: string,
      filter: string,
      callback: TrelloCallback<List[]>,
    ): void;
    getListsOnBoardByFilter(
      boardId: string,
      filter: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<List[]>,
    ): void;
    getListsOnBoardByFilter(
      boardId: string,
      filter: string,
      extraParams?: TrelloExtraParams,
    ): Promise<List[]>;

    getCardsOnBoard(boardId: string, callback: TrelloCallback<any>): void;
    getCardsOnBoard(
      boardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getCardsOnBoard(
      boardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getCardsOnBoardWithExtraParams(
      boardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getCardsOnBoardWithExtraParams(
      boardId: string,
      extraParams: TrelloExtraParams,
    ): Promise<any>;

    getCardsOnList(listId: string, callback: TrelloCallback<any>): void;
    getCardsOnList(
      listId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getCardsOnList(
      listId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getCardsOnListWithExtraParams(
      listId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getCardsOnListWithExtraParams(
      listId: string,
      extraParams: TrelloExtraParams,
    ): Promise<any>;

    deleteCard(cardId: string, callback: TrelloCallback<any>): void;
    deleteCard(
      cardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    deleteCard(cardId: string, extraParams?: TrelloExtraParams): Promise<any>;

    addWebhook(
      description: string,
      callbackUrl: string,
      idModel: string,
      callback: TrelloCallback<any>,
    ): void;
    addWebhook(
      description: string,
      callbackUrl: string,
      idModel: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addWebhook(
      description: string,
      callbackUrl: string,
      idModel: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    deleteWebhook(webhookId: string, callback: TrelloCallback<any>): void;
    deleteWebhook(
      webhookId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    deleteWebhook(
      webhookId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getLabelsForBoard(boardId: string, callback: TrelloCallback<any>): void;
    getLabelsForBoard(
      boardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getLabelsForBoard(
      boardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addLabelOnBoard(
      boardId: string,
      name: string,
      color: string,
      callback: TrelloCallback<any>,
    ): void;
    addLabelOnBoard(
      boardId: string,
      name: string,
      color: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addLabelOnBoard(
      boardId: string,
      name: string,
      color: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    deleteLabel(labelId: string, callback: TrelloCallback<any>): void;
    deleteLabel(
      labelId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    deleteLabel(labelId: string, extraParams?: TrelloExtraParams): Promise<any>;

    addLabelToCard(
      cardId: string,
      labelId: string,
      callback: TrelloCallback<any>,
    ): void;
    addLabelToCard(
      cardId: string,
      labelId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addLabelToCard(
      cardId: string,
      labelId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    deleteLabelFromCard(
      cardId: string,
      labelId: string,
      callback: TrelloCallback<any>,
    ): void;
    deleteLabelFromCard(
      cardId: string,
      labelId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    deleteLabelFromCard(
      cardId: string,
      labelId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateLabel(
      labelId: string,
      field: string,
      value: string,
      callback: TrelloCallback<any>,
    ): void;
    updateLabel(
      labelId: string,
      field: string,
      value: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateLabel(
      labelId: string,
      field: string,
      value: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateLabelName(
      labelId: string,
      name: string,
      callback: TrelloCallback<any>,
    ): void;
    updateLabelName(
      labelId: string,
      name: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateLabelName(
      labelId: string,
      name: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    updateLabelColor(
      labelId: string,
      color: string,
      callback: TrelloCallback<any>,
    ): void;
    updateLabelColor(
      labelId: string,
      color: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    updateLabelColor(
      labelId: string,
      color: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    getCardStickers(cardId: string, callback: TrelloCallback<any>): void;
    getCardStickers(
      cardId: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    getCardStickers(
      cardId: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addStickerToCard(
      cardId: string,
      image: string,
      left: number,
      top: number,
      zIndex: number,
      rotate: number,
      callback: TrelloCallback<any>,
    ): void;
    addStickerToCard(
      cardId: string,
      image: string,
      left: number,
      top: number,
      zIndex: number,
      rotate: number,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addStickerToCard(
      cardId: string,
      image: string,
      left: number,
      top: number,
      zIndex: number,
      rotate: number,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;

    addDueDateToCard(
      cardId: string,
      dateValue: string,
      callback: TrelloCallback<any>,
    ): void;
    addDueDateToCard(
      cardId: string,
      dateValue: string,
      extraParams: TrelloExtraParams,
      callback: TrelloCallback<any>,
    ): void;
    addDueDateToCard(
      cardId: string,
      dateValue: string,
      extraParams?: TrelloExtraParams,
    ): Promise<any>;
  }

  /** https://developers.trello.com/v1.0/reference#board-object  */
  export interface Board {
    id: string;
    name: string;
    desc: string;
    descData: string | null;
    closed: boolean;
    idOrganisation: string;
    pinned: boolean;
    url: string;
    shortUrl: string;
    prefs: any;
    labelNames: {
      [color: string]: string;
    };
    starred: boolean;
    limits: any;
    memberships: Membership[];
  }

  /* https://developers.trello.com/reference#list-object */
  export interface List {
    id: string;
    name: string;
    closed: boolean;
    idBoard: string;
    pos: number;
    subscribed: boolean;
  }

  /* https://developers.trello.com/reference#card-object */
  export interface Card {
    id: string;
    badges: Badges;
    checkItemStates: any[];
    closed: boolean;
    dateLastActivity: string;
    desc: string;
    descData: any;
    due?: string;
    dueComplete: boolean;
    idAttachmentCover?: string;
    idBoard: string;
    idChecklists: string[];
    idLabels: string[];
    idList: string;
    idMembers: string[];
    idMembersVoted: string[];
    idShort: number;
    labels: Label[];
    manualCoverAttachment: boolean;
    name: string;
    pos: number;
    shortLink: string;
    shortUrl: string;
    subscribed: boolean;
    url: string;
    address: string;
    locationName: string;
    coordinates: Coordinates;
  }

  export interface Badges {
    votes: number;
    viewingMemberVoted: boolean;
    subscribed: boolean;
    fogbugz: string;
    checkItems: number;
    checkItemsChecked: number;
    comments: number;
    attachments: number;
    description: boolean;
    due: string | null;
    dueComplete: boolean;
  }

  export type Coordinates = string | { latitude: number; longitude: number };

  export interface Label {
    id: string;
    name: string;
    color: string;
  }

  export interface Membership {
    id: string;
    idMember: string;
    memberType: string;
    unconfirmed: boolean;
  }
}
