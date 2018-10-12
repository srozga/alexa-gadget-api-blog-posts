import { Response } from "ask-sdk-model";
import { HandlerInput } from "ask-sdk-core";
import { WhackabuttonGame } from "./WhackabuttonGame";
import { IGameTurn } from "./IGameTurn";

export class GameState {
    public currentGame: GameType;
    public data: any;

    public static deleteState(handlerInput: HandlerInput): void {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        delete sessionAttr.game;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);
    }

    public static setInLaunchState(handlerInput: HandlerInput, val: boolean): void {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        sessionAttr.inLaunch = val;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);
    }

    public static setInPostGame(handlerInput: HandlerInput, val: boolean): void {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        sessionAttr.inPostGame = val;
        handlerInput.attributesManager.setSessionAttributes(sessionAttr);
    }

    public static getGameState(handlerInput: HandlerInput): GameState {
        const sessionAttr = handlerInput.attributesManager.getSessionAttributes();
        const game = sessionAttr.game;
        return new GameState(game);
    }

    constructor(obj?: GameState) {
        this.currentGame = GameType.None;
        if (obj) {
            this.currentGame = obj.currentGame;
            this.data = obj.data;
        }
    }

    public reinit(handlerInput: HandlerInput): Response {
        const gameTurn = this.resolveGameTurn(handlerInput);
        return gameTurn.initialize();
    }

    public resumeGameFromRollcall(handlerInput: HandlerInput): Response {
        const gameTurn = this.resolveGameTurn(handlerInput);
        return gameTurn.resumeAfterRollCall();
    }

    public cancel(handlerInput: HandlerInput): Response {
        const gameTurn = this.resolveGameTurn(handlerInput);
        return gameTurn.cancel();
    }

    public help(handlerInput: HandlerInput): Response {
        const gameTurn = this.resolveGameTurn(handlerInput);
        return gameTurn.help();
    }

    public handleInput(handlerInput: HandlerInput): Response {
        const gameTurn = this.resolveGameTurn(handlerInput);
        return gameTurn.handle();
    }

    private resolveGameTurn(handlerInput: HandlerInput): IGameTurn {
        switch (this.currentGame) {
            case GameType.WhackaButton:
                return new WhackabuttonGame(handlerInput);
            default:
                throw new Error("Unsupported game type.");
        }
    }

}

export enum GameType {
    None,
    WhackaButton
}