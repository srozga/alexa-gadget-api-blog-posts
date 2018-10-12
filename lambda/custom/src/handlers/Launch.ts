import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { LocalizedStrings } from "../helpers/LocalizedStrings";
import { SkillAnimations } from "../helpers/SkillAnimations";
import { SetLightDirectiveBuilder } from "../helpers/SetLightDirectiveBuilder";
import { GameState } from "../games/GameState";

export class LaunchHandler implements RequestHandler {
    canHandle(handlerInput: HandlerInput): boolean {
        const request = handlerInput.requestEnvelope.request;
        return request.type === "LaunchRequest";
    }

    handle(handlerInput: HandlerInput): Response {
        GameState.setInLaunchState(handlerInput, true);
        GameState.deleteState(handlerInput);

        const resp = LocalizedStrings.welcome();

        return handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt)
            .addDirective(SetLightDirectiveBuilder.setLightOnButtonDown(SkillAnimations.buttonDown()))
            .addDirective(SetLightDirectiveBuilder.setLightOnButtonDown(SkillAnimations.buttonUp()))
            .addDirective(SetLightDirectiveBuilder.setLight(SkillAnimations.skillLaunch()))
            .getResponse();
    }
}
