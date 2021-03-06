import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";

export class BuiltinAmazonCancelHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const request = handlerInput.requestEnvelope.request;
        return request.type === "IntentRequest" && request.intent.name === "AMAZON.CancelIntent";
    }

    handle(handlerInput: HandlerInput): Response {
        const speechText = "Goodbye!";

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
}