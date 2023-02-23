import BaseController from "./BaseController";
import UI5Event from "sap/ui/base/Event";
import Helper from "../util/Helper";
import Context from "sap/ui/model/odata/v4/Context";
import { IMessages, IChats } from "../types/ChatService";
import FeedInput from "sap/m/FeedInput";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

/**
 * @namespace com.p36.capui5gptchat.controller
 */
export default class Chat extends BaseController {
  /**
   * Called when the chat controller is instantiated.
   */
  public onInit(): void {
    this.getRouter().getRoute("chat").attachPatternMatched(this.onRouteMatched, this);
  }

  /**
   * Called when the view is rendered for the first time.
   */
  public onAfterRendering(): void {
    this.addKeyboardEventsToInput();
  }

  /**
   * Event handler for the route matched event.
   * Binds the chat to the view.
   *
   * @param event {sap.ui.base.Event}
   */
  public onRouteMatched(event: UI5Event): void {
    const { chat } = event.getParameter("arguments");
    this.getView().bindElement({
      path: `/Chats(${chat})`,
    });
  }

  /**
   * Called when the user presses the delete button.
   *
   * @param event {sap.ui.base.Event}
   */
  public onDeleteChat(event: UI5Event): void {
    Helper.withConfirmation("Delete Chat", "Are you sure you want to delete this chat?", async () => {
      await this.getChatService().deleteEntity(<Context>this.getView().getBindingContext());
      this.getRouter().navTo("home");
    });
  }

  /**
   * Event handler for the input field to post a message.
   *
   * @param event {sap.ui.base.Event}
   */
  public async onPostMessage(event: UI5Event): Promise<void> {
    const message = event.getParameter("value");
    const chat = <IChats>this.getView().getBindingContext().getObject();
    const chatService = this.getChatService();
    const binding = <ODataListBinding>this.getView().byId("messageList").getBinding("items");

    await chatService.createEntity<IMessages>(
      <IMessages>{
        text: message.trim(),
        model: chat.model,
        sender: this.getModel("user").getProperty("/displayName"),
        chat_ID: chat.ID,
      },
      binding,
      false,
      true
    );

    const completion = await chatService.getCompletion({
      chat: chat.ID,
      model: chat.model,
      personality: chat.personality_ID,
    });

    await chatService.createEntity<IMessages>(
      <IMessages>{
        text: completion.message,
        model: chat.model,
        sender: "AI",
        chat_ID: chat.ID,
      },
      binding,
      false,
      true
    );
  }

  /**
   * Add a keydown event listener to the input field to allow the user to post a message by pressing
   * the meta key (command key on Mac) and the enter key.
   * @private
   **/
  private addKeyboardEventsToInput(): void {
    const input = <FeedInput>this.getView().byId("newMessageInput");
    // @ts-ignore
    input.onkeydown = (event: any) => {
      if (event.keyCode == 13 && (event.ctrlKey || event.metaKey)) {
        input.fireEvent("post", { value: input.getValue() });
        input.setValue("");
        event.preventDefault();
      }
    };
  }
}
