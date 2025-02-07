import ListItemBase from "sap/m/ListItemBase";
import MessageListItemRenderer from "./MessageListItemRenderer";

/**
 * @namespace com.p36.capui5gptchat
 */
export default class MessageListItem extends ListItemBase {
  static readonly metadata = {
    properties: {
      message: { type: "string", group: "Misc", defaultValue: "" },
      sender: { type: "string", group: "Misc", defaultValue: "" },
      date: { type: "string", group: "Misc", defaultValue: "" },
    },
    aggregations: {
      avatar: { type: "sap.m.Avatar", multiple: false },
    },
  };

  renderer = MessageListItemRenderer;
}
