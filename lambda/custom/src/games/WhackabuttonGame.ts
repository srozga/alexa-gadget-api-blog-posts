import { HandlerInput } from "ask-sdk-core";
import { Response, interfaces, services } from "ask-sdk-model";
import * as moment from "moment";
import { LocalizedStrings } from "../helpers/LocalizedStrings";
import { RollCall, GameButton } from "../helpers/RollCall";
import { GameState, GameType } from "./GameState";
import { Utilities } from "../helpers/Utilities";
import { InputHandler } from "../helpers/InputHandler";
import { IGameTurn, GameHelpers } from "./IGameTurn";
import { SetLightDirectiveBuilder } from "../helpers/SetLightDirectiveBuilder";
import { SkillAnimations } from "../helpers/SkillAnimations";

const WHACKABUTTON_NUM_OF_BUTTONS = 2;
const MIN_TIME_TO_PRESS = 2500;
const MAX_TIME_TO_PRESS = 10000;
const TIMEOUT_EVENT_NAME = "failed";
const GAME_DURATION_SECONDS = 5;

export class WhackabuttonGame implements IGameTurn {
    constructor(public handlerInput: HandlerInput) {
    }

    public initialize(): Response {
        const game = new GameState();
        game.currentGame = GameType.WhackaButton;
        game.data = new WhackState();

        GameHelpers.setState(this.handlerInput, game);
        return RollCall.initialize(this.handlerInput, WHACKABUTTON_NUM_OF_BUTTONS);
    }

    public help(): Response {
        const resp = LocalizedStrings.whack_game_help();
        return this.handlerInput.responseBuilder.speak(resp.speech).getResponse();
    }

    public cancel(): Response {
        const resp = LocalizedStrings.whack_game_cancel();
        GameState.deleteState(this.handlerInput);
        return this.handlerInput.responseBuilder
            .speak(resp.reprompt)
            .withShouldEndSession(true)
            .getResponse();
    }


    public resumeAfterRollCall(): Response {
        const gameState = GameHelpers.getState(this.handlerInput, new WhackState());
        const whackState = <WhackState>gameState.data;
        whackState.waitingOnConfirmation = true;
        whackState.pushAndTrimHandler(this.handlerInput.requestEnvelope.request.requestId);
        GameHelpers.setState(this.handlerInput, gameState);

        const confirmationInputHandler = this.generateConfirmationHandler(GameHelpers.getAvailableButtons(this.handlerInput));

        const resp = LocalizedStrings.whack_start();
        this.handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt)
            .addDirective(confirmationInputHandler);
        return this.handlerInput.responseBuilder.getResponse();
    }

    public handle(): Response {
        const state = GameHelpers.getState(this.handlerInput, new WhackState());
        const whackState = <WhackState>state.data;
        let gameStarting = false;

        const inputHandlerEvent = this.handlerInput.requestEnvelope.request.type === "GameEngine.InputHandlerEvent"
            ? this.handlerInput.requestEnvelope.request : null;

        if (!inputHandlerEvent) {
            // return empty response if this isn't an InputHandlerEvent request
            return this.handlerInput.responseBuilder.getResponse();
        }

        // need to cast to any because the class doesn't expose originatingRequestId
        // this is necesary...
        let ev = <any>inputHandlerEvent;
        if (!whackState.lastHandlerIds.some(p => p === ev.originatingRequestId)) {
            console.warn(`SKIPPING MESSAGE.\nLAST HANDLER IDs: \n${JSON.stringify(whackState.lastHandlerIds, null, 2)}`
                + `\nORIGINATING REQUEST ID: ${ev.originatingRequestId}`);
            return this.handlerInput.responseBuilder.getResponse();
        }

        if (whackState.waitingOnConfirmation) {
            // if we still haven't started the game... let's start it
            gameStarting = true;
            whackState.initGame();
        }

        const diff = whackState.timeSinceStarted();
        if (diff >= GAME_DURATION_SECONDS) {
            console.log("Finishing game...");
            return this.finish(this.handlerInput, true);
        } else {
            let hasBad = false;
            const evNamesAndMaxTime = GameHelpers.getEventsAndMaxTimeSince(
                inputHandlerEvent.events!, moment.utc(whackState.lastEventTime), TIMEOUT_EVENT_NAME);
            const relevantEvents = evNamesAndMaxTime.events;
            if (!gameStarting && relevantEvents.length === 0) {
                // nothing is relevant so we just ignore it.
                return this.handlerInput.responseBuilder.getResponse();
            }

            const isTimeout = relevantEvents.some(p => p === TIMEOUT_EVENT_NAME);
            let goodPressedButtons: string[] = [];
            if (isTimeout) {
                console.log(`received timeout event`);
            } else if (!gameStarting) {
                const result = this.processRelevantEvents(relevantEvents, whackState);
                goodPressedButtons = result.good;
                hasBad = result.bad.length > 0;
            }

            if (!isTimeout) {
                const lastUpdate = moment.utc(evNamesAndMaxTime.maxTime).format(Utilities.DT_FORMAT);
                whackState.lastEventTime = lastUpdate;
            }

            // get the buttons assigned to the game
            const btns = GameHelpers.getAvailableButtons(this.handlerInput);

            let res: Response | undefined;
            if (whackState.expectedEvents.length === 0 || isTimeout) {
                res = this.turnDone(whackState, isTimeout, gameStarting, btns);
            } else {
                // otherwise, this means we either answered a right or wrong but we keep going
                res = this.buttonsOutstanding(whackState, hasBad, goodPressedButtons, btns);
            }

            GameHelpers.setState(this.handlerInput, state);
            return res;
        }
    }

    private processRelevantEvents(relevantEvents: string[], whackState: WhackState): { good: string[], bad: string[] } {
        console.log(`received events ${JSON.stringify(relevantEvents)}`);
        const result: { good: string[], bad: string[] } = {
            good: [],
            bad: []
        };

        relevantEvents.forEach(evName => {
            // check if we are expecting this event
            const index = whackState.expectedEvents.findIndex(val => val.name === evName);
            if (index > -1) {
                // if we are, great. increase score and remove event from expected list.
                console.log(`increasing good`);
                result.good.push(whackState.expectedEvents[index].gadgetId);
                whackState.good++;
                whackState.expectedEvents.splice(index, 1);
            } else {
                // otherwise, increase bad count.
                console.log(`increasing bad. setting had bad to true.`);
                console.log(`still expecting number of buttons ${whackState.expectedEvents.length}`);
                result.bad.push(evName);
                whackState.bad++;
            }
        });

        return result;
    }

    private turnDone(whackState: WhackState, isTimeout: boolean, gameStarting: boolean, btns: GameButton[]): Response {
        // if the user has finished the current turn or there is a timeout
        // we re-generate the input
        if (isTimeout) {
            console.log("timed out... regenerating!");
        } else {
            console.log(`expecting 0 in current turn. generating handler.`);
        }

        // we select buttons randomly for the next turn
        const shuffle = Utilities.shuffle(btns.slice(0));
        const num = Utilities.randInt(1, shuffle.length);
        console.log(`generating input handler with ${num} buttons.`);

        const buttonsInPlay = shuffle.slice(0, num);
        const buttonsNotInPlay = btns.filter(p => !buttonsInPlay.some(p1 => p1 === p));
        console.log(`${buttonsInPlay.length} buttons in play for next turn: ${JSON.stringify(buttonsInPlay)}. ` +
            `Not in play: ${JSON.stringify(buttonsNotInPlay)}`);

        // assign a random time duration to the turn, but make sure we don't go past the max game duration
        const timeTilEnd = whackState.timeInMsUntilEnd();
        console.log(`${timeTilEnd}ms left until end`);
        const turnDuration = Math.min(Utilities.randInt(MIN_TIME_TO_PRESS, MAX_TIME_TO_PRESS), timeTilEnd);

        whackState.expectedEvents = buttonsInPlay;
        whackState.pushAndTrimHandler(this.handlerInput.requestEnvelope.request.requestId);
        whackState.lastHandlerStartTime = moment().utc().format(Utilities.DT_FORMAT);
        whackState.lastHandlerLength = turnDuration;

        // generate the input handler
        const startHandler = this.generateInputHandlerTemplate(btns, turnDuration);

        // turn off buttons not assigned to this turn and turn on buttons assigned to the turn
        const turnOffEverything = SetLightDirectiveBuilder.setLight(
            SkillAnimations.rollCallFinishedUnused(), buttonsNotInPlay.map(p => p.gadgetId));
        const setLight = SetLightDirectiveBuilder.setLight(
            SkillAnimations.lightUpWhackaButton(turnDuration), buttonsInPlay.map(p => p.gadgetId));

        // save the updated state and construct response
        let rb = this.handlerInput.responseBuilder;
        if (!gameStarting && !isTimeout) {
            rb = rb.speak(LocalizedStrings.whack_turn_done().speech);
        } else if (gameStarting) {
            rb = rb.speak(LocalizedStrings.whack_begin().speech);
        }

        return rb
            .addDirective(turnOffEverything)
            .addDirective(setLight)
            .addDirective(startHandler)
            .getResponse();
    }

    private buttonsOutstanding(whackState: WhackState, hasBad: boolean, goodPressedButtons: string[], btns: GameButton[]): Response {
        console.log(`responding with acknowlegment and new handler; more buttons remaining`);

        const now = moment.utc();
        const turnDuration = whackState.lastHandlerLength - (now.diff(whackState.lastHandlerStartTime, "ms"));
        whackState.lastHandlerStartTime = now.format(Utilities.DT_FORMAT);
        whackState.lastHandlerLength = turnDuration;
        whackState.pushAndTrimHandler(this.handlerInput.requestEnvelope.request.requestId);

        const startHandler = this.generateInputHandlerTemplate(btns, turnDuration);
        let rb = this.handlerInput.responseBuilder.addDirective(startHandler);
        if (hasBad) {
            rb.speak(LocalizedStrings.whack_bad_answer().speech);
        }

        // need to turn off all good pressed buttons
        if (goodPressedButtons.length > 0) {
            rb = rb.addDirective(SetLightDirectiveBuilder.setLight(SkillAnimations.rollCallFinishedUnused(), goodPressedButtons));
        }
        return rb.getResponse();
    }


    public postGameSummary(): Response {
        return this.finish(this.handlerInput, false);
    }

    private finish(handlerInput: HandlerInput, finish: boolean): Response {
        const whackState = <WhackState>GameHelpers.getState(handlerInput, new WhackState()).data;
        GameState.setInPostGame(handlerInput, true);

        let resp = LocalizedStrings.whack_summary({
            score: whackState.good - whackState.bad,
            good: whackState.good,
            bad: whackState.bad
        });
        if (finish) {
            resp = LocalizedStrings.whack_finish({
                score: whackState.good - whackState.bad,
                good: whackState.good,
                bad: whackState.bad
            });
        }

        const turnOffEverything = SetLightDirectiveBuilder.setLight(
            SkillAnimations.rollCallFinishedUnused());

        return handlerInput.responseBuilder
            .speak(resp.speech)
            .reprompt(resp.reprompt)
            .addDirective(turnOffEverything)
            .getResponse();
    }

    private generateInputHandlerTemplate(
        allButtons: Array<GameButton>, timeout?: number): interfaces.gameEngine.StartInputHandlerDirective {
        const handler = <interfaces.gameEngine.StartInputHandlerDirective>JSON.parse(JSON.stringify(this.handlerTemplate));

        console.log(`generating input handler for all ${JSON.stringify(allButtons)}.`);
        for (let i = 0; i < allButtons.length; i++) {
            const btn = allButtons[i];
            const name = btn.name;
            const newRecognizer: services.gameEngine.PatternRecognizer = {
                type: "match",
                anchor: "start",
                fuzzy: true,
                pattern: [
                    {
                        action: "down",
                        gadgetIds: [btn.gadgetId]
                    },
                    {
                        action: "up",
                        gadgetIds: [btn.gadgetId]
                    }
                ]
            };
            handler.recognizers![name] = newRecognizer;

            handler.events![name] = {
                shouldEndInputHandler: false,
                meets: [name],
                // maximumInvocations: 1,
                reports: "matches"
            };
        }
        if (timeout) {
            handler.timeout = timeout;
        } else {
            handler.timeout = Utilities.TIMEOUT_DEFAULT;
        }
        return handler;
    }

    readonly handlerTemplate: interfaces.gameEngine.StartInputHandlerDirective = {
        type: "GameEngine.StartInputHandler",
        proxies: [],
        recognizers: {
        },
        events: {
            failed: {
                meets: ["timed out"],
                reports: "history",
                shouldEndInputHandler: true
            }
        }
    };

    private generateConfirmationHandler(buttons: Array<GameButton>): interfaces.gameEngine.StartInputHandlerDirective {
        const recognizers: { [index: string]: services.gameEngine.PatternRecognizer } = {};
        const events: { [index: string]: services.gameEngine.Event } = {};

        console.log("Creating confirmation handler. User can press any button from: " + JSON.stringify(buttons));
        for (let i = 0; i < buttons.length; i++) {
            const name = `btn${i + 1}`;
            const newRecognizer: services.gameEngine.PatternRecognizer = {
                type: "match",
                anchor: "start",
                fuzzy: false,
                pattern: [
                    {
                        action: "down",
                        gadgetIds: [buttons[i].gadgetId]
                    },
                    {
                        action: "up",
                        gadgetIds: [buttons[i].gadgetId]
                    }
                ]
            };
            recognizers[name] = newRecognizer;

            events[name] = {
                shouldEndInputHandler: true,
                meets: [name],
                reports: "matches"
            };
        }

        return InputHandler.StartHandler(recognizers, events);
    }
}

class WhackState {
    public startTime: string | undefined;
    public good: number = 0;
    public bad: number = 0;
    public turn: number = 0;
    public waitingOnConfirmation: boolean = false;

    public expectedEvents: Array<GameButton> = [];
    public lastEventTime: string | undefined;
    public lastHandlerIds: Array<string> = [];
    public lastHandlerStartTime: string | undefined;
    public lastHandlerLength: number = 0;

    public initGame(): void {
        console.log(`initializing game. start time ${moment.utc(this.startTime).format(Utilities.DT_FORMAT)}`);

        this.waitingOnConfirmation = false;
        this.expectedEvents = [];
        this.bad = 0;
        this.good = 0;
        this.startTime = moment.utc().format(Utilities.DT_FORMAT);
        this.lastEventTime = this.startTime;
    }

    public pushAndTrimHandler(reqId: string): void {
        this.lastHandlerIds.push(reqId);
        while (this.lastHandlerIds.length > WHACKABUTTON_NUM_OF_BUTTONS + 2) {
            this.lastHandlerIds.shift();
        }
    }

    public timeInMsUntilEnd(): number {
        const now = moment.utc();
        const start = moment.utc(this.startTime);
        const end = start.add(GAME_DURATION_SECONDS, "s");
        const diff = end.diff(now, "ms");
        return diff;
    }

    public timeSinceStarted(): number {
        const now = moment.utc();
        const start = moment.utc(this.startTime);
        const diff = now.diff(start, "s");
        console.log(`it has been ${diff} seconds since the game started.`);
        return diff;
    }

}
