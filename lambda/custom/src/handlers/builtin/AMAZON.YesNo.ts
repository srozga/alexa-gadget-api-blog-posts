import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { LocalizedStrings } from "../../helpers/LocalizedStrings";

export class BuiltinAmazonYesNoHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const request = handlerInput.requestEnvelope.request;
        return request.type === "IntentRequest" &&
            (request.intent.name === "AMAZON.YesIntent" ||
                request.intent.name === "AMAZON.NoIntent");
    }

    handle(handlerInput: HandlerInput): Response {
        const resp = LocalizedStrings.donotunderstand();

        return handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt)
            .getResponse();
    }
}