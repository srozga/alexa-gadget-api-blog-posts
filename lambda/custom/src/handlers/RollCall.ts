import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response, interfaces } from "ask-sdk-model";
import { RollCall } from "../helpers/RollCall";

export class RollCallHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        return sessionAttr.inRollcall &&
            (handlerInput.requestEnvelope.request.type === "GameEngine.InputHandlerEvent");
    }

    handle(handlerInput: HandlerInput): Response {
        const inputEventRequest = handlerInput.requestEnvelope.request as interfaces.gameEngine.InputHandlerEventRequest;
        if (inputEventRequest) {
            return RollCall.handleInput(handlerInput, inputEventRequest);
        } else {
            throw new Error("Unexpected event type. Not supported in roll call.");
        }
    }
}