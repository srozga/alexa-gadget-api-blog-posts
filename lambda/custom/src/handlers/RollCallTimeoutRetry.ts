import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response, IntentRequest } from "ask-sdk-model";
import { RollCall } from "../helpers/RollCall";
import { LocalizedStrings } from "../helpers/LocalizedStrings";

export class RollCallTimeoutRetryHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        return sessionAttr.inRollcall &&
            sessionAttr.rollcallTimeout > 0 &&
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            (handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent" ||
                handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent");
    }

    handle(handlerInput: HandlerInput): Response {
        const intentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        if (intentRequest) {
            if (intentRequest.intent.name === "AMAZON.YesIntent") {
                return RollCall.initialize(handlerInput);
            } else if (intentRequest.intent.name === "AMAZON.NoIntent") {
                const resp = LocalizedStrings.goodbye();
                return handlerInput.responseBuilder
                    .speak(resp.speech)
                    .withShouldEndSession(true)
                    .getResponse();
            }
        }
        throw new Error("Unexpected input type. Not supported.");
    }
}