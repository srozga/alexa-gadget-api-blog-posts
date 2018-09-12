import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { LocalizedStrings } from "../helpers/LocalizedStrings";

export class LaunchHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const request = handlerInput.requestEnvelope.request;
        return request.type === "LaunchRequest";
    }

    handle(handlerInput: HandlerInput): Response {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        sessionAttr.inLaunch = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);

        const resp = LocalizedStrings.welcome();

        return handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt).getResponse();
    }
}
