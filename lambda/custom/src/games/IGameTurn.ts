import { HandlerInput } from "ask-sdk-core";
import { Response, services } from "ask-sdk-model";
import * as moment from "moment";
import { GameButton } from "../helpers/RollCall";
import { GameState } from "./GameState";
import { Utilities } from "../helpers/Utilities";

export interface IGameTurn {
    initialize(): Response;
    handle(): Response;
    help(): Response;
    cancel(): Response;
    postGameSummary(): Response;
    resumeAfterRollCall(): Response;
}

export module GameHelpers {
    export function getState<T>(handlerInput: HandlerInput, dataInstance: T): GameState {
        const game = GameState.getGameState(handlerInput);
        if (game.data) {
            game.data = Object.assign(dataInstance, game.data);
        }
        return game;
    }
    export function setState(handlerInput: HandlerInput, game: GameState): void {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        sessionAttr.game = game;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);
        console.log("Setting state: " + JSON.stringify(sessionAttr));
    }
    export function getAvailableButtons(handlerInput: HandlerInput): Array<GameButton> {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        const result = sessionAttr.rollcallResult;
        return result;
    }

    /*
    * Retrieves all of the events coming into the game
    */
    export function getEventsAndMaxTimeSince(
        events: services.gameEngine.InputHandlerEvent[],
        lastEvent: moment.Moment,
        timeoutEventName: string)
        : { maxTime: moment.Moment, events: Array<string> } {
        if (events.some(p => p.name! === timeoutEventName)) {
            return { maxTime: moment.utc(lastEvent), events: [timeoutEventName] };
        }

        const mapped = events
            .map(p => {
                const temp = p.inputEvents!.map(p1 => moment(p1.timestamp!).utc().valueOf());
                const max = moment.utc(Math.max.apply({}, temp));
                const diff = max.diff(lastEvent, "ms");
                console.log(`temp: ${JSON.stringify(temp)}`);
                console.log(`max: ${max.format(Utilities.DT_FORMAT)}`);
                return { max: max.valueOf(), maxMoment: max, diff: diff, name: p.name! };
            });

        console.log(`Mapping events last update${lastEvent.format(Utilities.DT_FORMAT)}: \n${JSON.stringify(mapped, null, 2)}`);
        const filtered = mapped.filter(p => p.diff > 0);
        let globalMax = Math.max.apply({}, filtered.map(p => p.max));
        console.log(`temp global max ${globalMax}`);
        if (!globalMax || isNaN(globalMax) || !isFinite(globalMax)) {
            console.log(`setting global max to ${lastEvent.valueOf()}`);
            globalMax = lastEvent.valueOf();
        }
        const resultGlobalMax = moment.utc(globalMax);
        console.log(`GLOBAL MAX ${resultGlobalMax.format(Utilities.DT_FORMAT)}`);

        const array = filtered.map(p => p.name);
        const result = { maxTime: resultGlobalMax, events: array };
        console.log(`returning result\n${JSON.stringify(result)}`);
        return result;
    }
}