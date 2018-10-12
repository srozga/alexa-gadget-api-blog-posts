import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { GameState } from "../games/GameState";
import { LocalizedStrings } from "../helpers/LocalizedStrings";

export class InGameHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        const result = !sessionAttr.inPostGame &&
            !sessionAttr.inRollcall &&
            sessionAttr.game &&
            (handlerInput.requestEnvelope.request.type === "GameEngine.InputHandlerEvent"
                || handlerInput.requestEnvelope.request.type === "IntentRequest");

        console.log(`InGameHandler: ${result}`);
        return result;
    }

    handle(handlerInput: HandlerInput): Response {
        console.log("executing in game state handler");
        const gameState = GameState.getGameState(handlerInput);
        if (handlerInput.requestEnvelope.request.type === "GameEngine.InputHandlerEvent") {
            return gameState.handleInput(handlerInput);
        } else if (handlerInput.requestEnvelope.request.type === "IntentRequest") {
            const intent = handlerInput.requestEnvelope.request.intent;

            if (intent.name === "AMAZON.CancelIntent" || intent.name === "AMAZON.StopIntent") {
                return gameState.cancel(handlerInput);
            } else if (intent.name === "AMAZON.HelpIntent") {
                return gameState.help(handlerInput);
            } else if (intent.name === "AMAZON.StopIntent") {
                return handlerInput.responseBuilder
                    .speak(LocalizedStrings.goodbye().speech)
                    .withShouldEndSession(true)
                    .getResponse();
            } else {
                // empty response for anything else  that comes in during game play
                return handlerInput.responseBuilder.getResponse();
            }
        }
        throw new Error("Unexpected event type. Not supported in roll call.");

    }
}