import { interfaces, services } from "ask-sdk-model";
import { Utilities } from "./Utilities";

export module InputHandler {
    export function StopHandler(id: string): interfaces.gameEngine.StopInputHandlerDirective {
        const d: interfaces.gameEngine.StopInputHandlerDirective = {
            type: "GameEngine.StopInputHandler",
            originatingRequestId: id
        };
        return d;
    }

    export function StartHandler(
        recognizers: { [key: string]: services.gameEngine.PatternRecognizer },
        events: { [key: string]: services.gameEngine.Event },
        timeout?: number):
        interfaces.gameEngine.StartInputHandlerDirective {
        const d: interfaces.gameEngine.StartInputHandlerDirective = {
            type: "GameEngine.StartInputHandler",
            timeout: timeout,
            proxies: [],
            events: {
                failed: {
                    meets: ["timed out"],
                    reports: "history",
                    shouldEndInputHandler: true
                }
            }
        };
        if (timeout) {
            d.timeout = timeout;
        } else {
            d.timeout = Utilities.TIMEOUT_DEFAULT;
        }
        Object.assign(d.events, events);
        d.recognizers = recognizers;

        return d;
    }
}