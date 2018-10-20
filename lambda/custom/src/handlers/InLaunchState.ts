
import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response, IntentRequest } from "ask-sdk-model";
import { LocalizedStrings } from "../helpers/LocalizedStrings";
import { WhackabuttonGame } from "../games/WhackabuttonGame";
import { GameState } from "../games/GameState";

export class InLaunchStateHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        return sessionAttr.inLaunch
            && handlerInput.requestEnvelope.request.type === "IntentRequest"
            && (handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
                || handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent");
    }

    handle(handlerInput: HandlerInput): Response {
        console.log("executing in launch state handler");

        if (handlerInput.requestEnvelope.request.type === "IntentRequest") {
            const req = handlerInput.requestEnvelope.request as IntentRequest;
            if (req.intent.name === "AMAZON.YesIntent" || req.intent.name === "StartGameIntent") {
                const game = new WhackabuttonGame(handlerInput);
                GameState.setInLaunchState(handlerInput, false);
                return game.initialize();
            } else if (req.intent.name === "AMAZON.NoIntent") {
                // exit
                GameState.setInLaunchState(handlerInput, false);
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