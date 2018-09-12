
import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response, IntentRequest } from "ask-sdk-model";
import { LocalizedStrings } from "../helpers/LocalizedStrings";
import { RollCall } from "../helpers/RollCall";

export class InLaunchStateHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        return sessionAttr.inLaunch;
    }

    handle(handlerInput: HandlerInput): Response {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        sessionAttr.inLaunch = false;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);

        const req = handlerInput.requestEnvelope.request as IntentRequest;
        if (req) {
            if (req.intent.name === "AMAZON.YesIntent") {
                // proceed to roll call
                return RollCall.initialize(handlerInput);
            } else if (req.intent.name === "AMAZON.NoIntent") {
                // exit
                return handlerInput.responseBuilder
                    .speak(LocalizedStrings.goodbye().speech)
                    .getResponse();
            }
        }

        const donotresp = LocalizedStrings.donotunderstand();
        return handlerInput.responseBuilder
            .speak(donotresp.speech)
            .reprompt(donotresp.reprompt)
            .getResponse();
    }
}