
import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response, IntentRequest } from "ask-sdk-model";
import { LocalizedStrings } from "../helpers/LocalizedStrings";
import { WhackabuttonGame } from "../games/WhackabuttonGame";
import { GameState } from "../games/GameState";

export class PostGameStateHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        const issupportedintent = handlerInput.requestEnvelope.request.type === "IntentRequest"
            && ["AMAZON.YesIntent",
                "AMAZON.NoIntent",
                "StartGameIntent",
                "ScoreIntent"]
                .some(p => p === (<IntentRequest>handlerInput.requestEnvelope.request).intent.name);
        return sessionAttr.inPostGame && issupportedintent;
    }

    handle(handlerInput: HandlerInput): Response {
        console.log("executing in post game state handler");

        if (handlerInput.requestEnvelope.request.type === "IntentRequest") {
            const req = handlerInput.requestEnvelope.request as IntentRequest;
            if (req.intent.name === "AMAZON.YesIntent" || req.intent.name === "StartGameIntent") {
                GameState.deleteState(handlerInput);
                const game = new WhackabuttonGame(handlerInput);
                GameState.setInPostGame(handlerInput, false);
                return game.initialize();
            } else if (req.intent.name === "AMAZON.NoIntent") {
                GameState.deleteState(handlerInput);
                GameState.setInPostGame(handlerInput, false);
                return handlerInput.responseBuilder
                    .speak(LocalizedStrings.goodbye().speech)
                    .getResponse();
            } else if(req.intent.name === "ScoreIntent") {
                return new WhackabuttonGame(handlerInput).postGameSummary();
            }
        }

        const donotresp = LocalizedStrings.donotunderstand();
        return handlerInput.responseBuilder
            .speak(donotresp.speech)
            .reprompt(donotresp.reprompt)
            .getResponse();
    }
}