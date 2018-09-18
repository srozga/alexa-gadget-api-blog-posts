import { HandlerInput } from "ask-sdk-core";
import { Response, interfaces, services } from "ask-sdk-model";
import { LocalizedStrings } from "./LocalizedStrings";
import { SkillAnimations } from "../helpers/SkillAnimations";
import { SetLightDirectiveBuilder } from "../helpers/SetLightDirectiveBuilder";

const numOfButtons = 2;

export module RollCall {
    export function initialize(handlerInput: HandlerInput): Response {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        sessionAttr.inRollcall = true;
        sessionAttr.rollcallButtonsCheckedIn = 0;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);

        const resp = LocalizedStrings.rollcall_start();
        return handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt)
            .addDirective(createRollCallDirective(numOfButtons, 20000))
            .addDirective(SetLightDirectiveBuilder.setLight(SkillAnimations.rollCallInitialized()))
            .getResponse();
    }

    export function handleInput(handlerInput: HandlerInput,
        input: interfaces.gameEngine.InputHandlerEventRequest): Response {
        const inputEvents = input.events!;

        if (inputEvents.some(p => p.name === "failed")) {
            return handleTimeoutOut(handlerInput);
        } else {
            const complete = inputEvents.find(p => p.name === "complete");
            if (complete) {
                return handleDone(handlerInput, complete);
            } else {
                return handleButtonCheckin(handlerInput, inputEvents);
            }
        }
    }

    export function handleButtonCheckin(handlerInput: HandlerInput, inputEvents: Array<services.gameEngine.InputHandlerEvent>): Response {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();


        const directives = inputEvents.map(ev => {
            const gadgetIds = getGadgetIds(ev);
            return SetLightDirectiveBuilder.setLight(SkillAnimations.rollCallButtonSelected(), gadgetIds);
        });

        sessionAttr.rollcallButtonsCheckedIn += directives.length;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);
        const resp = LocalizedStrings.rollcall_checkin(numOfButtons - sessionAttr.rollcallButtonsCheckedIn);

        let temp = handlerInput.responseBuilder.speak(resp.speech);
        directives.forEach(p => temp.addDirective(p));
        return temp.getResponse();
    }

    function getGadgetIds(ev: services.gameEngine.InputHandlerEvent): string[] {
        const btns = ev!.inputEvents!.map(p => { return p.gadgetId!; });
        return btns;
    }

    export function handleDone(handlerInput: HandlerInput,
        complete: services.gameEngine.InputHandlerEvent): Response {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        clearSessionAttr(sessionAttr);
        const btns = complete!.inputEvents!.map(p => { return { name: "", id: p.gadgetId }; });
        for (let i = 0; i < btns.length; i++) {
            btns[i].name = "btn" + (i + 1);
        }

        sessionAttr.rollcallResult = btns;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);

        const blackOutUnusedButtons = SetLightDirectiveBuilder.setLight(SkillAnimations.rollCallFinishedUnused());
        const lightUpSelectedButtons = SetLightDirectiveBuilder.setLight(SkillAnimations.rollCallFinishedSelected(), btns.map(p => p.id!));

        console.log(`Registered buttons: \n${JSON.stringify(btns, null, 2)}`);

        const resp = LocalizedStrings.rollcall_done();
        return handlerInput.responseBuilder
            .speak(resp.speech)
            .addDirective(blackOutUnusedButtons)
            .addDirective(lightUpSelectedButtons)
            .withShouldEndSession(true)
            .getResponse();
    }

    export function handleTimeoutOut(handlerInput: HandlerInput): Response {
        const resp = LocalizedStrings.rollcall_timedout();
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        if (sessionAttr.rollcallTimeout) {
            sessionAttr.rollcallTimeout++;
            if (sessionAttr.rollcallTimeout >= 2) {
                clearSessionAttr(sessionAttr);
                handlerInput.attributesManager.setSessionAttributes(sessionAttr);

                const exit = LocalizedStrings.rollcall_timeout_exit();
                return handlerInput.responseBuilder
                    .speak(exit.speech)
                    .withShouldEndSession(true)
                    .getResponse();
            }
        } else {
            sessionAttr.rollcallTimeout = 1;
        }

        handlerInput.attributesManager.setSessionAttributes(sessionAttr);
        return handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt)
            .getResponse();
    }

    function clearSessionAttr(sessionAttr: { [key: string]: any }): void {
        delete sessionAttr.inRollcall;
        delete sessionAttr.rollcallTimeout;
        delete sessionAttr.rollcallButtonsCheckedIn;
    }

    export function createRollCallDirective(numOfButtons: number, timeout?: number): interfaces.gameEngine.StartInputHandlerDirective {
        const handler = JSON.parse(JSON.stringify(rollcallHandlerTemplate));
        if (timeout) {
            handler.timeout = timeout;
        }

        if (numOfButtons > 4 || numOfButtons < 1) {
            throw new Error("Only 1-4 buttons are supported.");
        }

        for (let i = 0; i < numOfButtons; i++) {
            const proxy = "btn" + (i + 1);
            const recognizer = "recognizer_" + proxy;
            const eventName = "event_" + proxy;

            const patternStep: services.gameEngine.Pattern = {
                action: "down",
                gadgetIds: [proxy]
            };
            handler.proxies!.push(proxy);

            (handler.recognizers!["all pressed"] as services.gameEngine.PatternRecognizer)
                .pattern!.push(patternStep);

            const newRecognizer: services.gameEngine.PatternRecognizer = {
                anchor: "end",
                fuzzy: true,
                type: "match",
                pattern: [patternStep]
            };

            handler.recognizers![recognizer] = newRecognizer;

            handler.events![eventName] = {
                shouldEndInputHandler: false,
                maximumInvocations: 1,
                meets: [recognizer],
                reports: "matches"
            };
        }

        return handler;
    }

    const rollcallHandlerTemplate: interfaces.gameEngine.StartInputHandlerDirective = {
        type: "GameEngine.StartInputHandler",
        proxies: [],
        recognizers: {
            "all pressed": {
                type: "match",
                fuzzy: true,
                anchor: "start",
                pattern: []
            }
        },
        events: {
            complete: {
                meets: ["all pressed"],
                reports: "matches",
                shouldEndInputHandler: true
            },
            failed: {
                meets: ["timed out"],
                reports: "history",
                shouldEndInputHandler: true
            }
        }
    };

}