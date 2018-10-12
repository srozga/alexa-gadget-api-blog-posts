import * as i18next from "i18next";

export interface ILocalizationResult {
    speech: string;
    reprompt: string;
}

export module LocalizedStrings {

    export function donotunderstand(): ILocalizationResult {
        return {
            speech: i.t("donotunderstand_speech"),
            reprompt: i.t("donotunderstand_reprompt")
        };
    }

    export function welcome(): ILocalizationResult {
        return {
            speech: i.t("welcome_speech"),
            reprompt: i.t("welcome_reprompt")
        };
    }

    export function goodbye(): ILocalizationResult {
        return {
            speech: i.t("goodbye"),
            reprompt: ""
        };
    }
    export function rollcall_timedout(): ILocalizationResult {
        return {
            speech: i.t("rollcall_timeout_speech"),
            reprompt: i.t("rollcall_timeout_reprompt")
        };
    }

    export function rollcall_done(): ILocalizationResult {
        return {
            speech: i.t("rollcall_done_speech"),
            reprompt: ""
        };
    }

    export function rollcall_timeout_exit(): ILocalizationResult {
        return {
            speech: i.t("rollcall_timeout_exit"),
            reprompt: ""
        };
    }

    export function rollcall_start(numOfButtons: number): ILocalizationResult {
        return {
            speech: i.t("rollcall_start_speech", { num: numOfButtons }),
            reprompt: i.t("rollcall_start_reprompt")
        };
    }

    export function rollcall_checkin(num: number): ILocalizationResult {
        return {
            speech: i.t("rollcall_checkin", { num: num }),
            reprompt: ""
        };
    }

    export function whack_start(): ILocalizationResult {
        return {
            speech: i.t("whack_description"),
            reprompt: i.t("whack_start_button_prompt_reprompt")
        };
    }

    export function whack_help(): ILocalizationResult {
        return { speech: i.t("whack_description"), reprompt: "" };
    }

    export function whack_summary(result: { score: number, good: number, bad: number }): ILocalizationResult {
        return {
            speech: i.t("whack_game_summary_speech", result),
            reprompt: i.t("whack_game_summary_reprompt")
        };
    }

    export function whack_finish(result: { score: number, good: number, bad: number }): ILocalizationResult {
        const theRest = { rest: i.t("whack_game_summary_speech", result)};
        const key = result.score > 10 ? "whack_game_summary_good" : "whack_game_summary_bad";

        return {
            speech: i.t(key, theRest),
            reprompt: i.t("whack_game_summary_reprompt")
        };
    }

    export function whack_turn_done(): ILocalizationResult {
        return {
            speech: i.t("whack_game_turn_done"), reprompt: ""
        };
    }

    export function whack_begin(): ILocalizationResult {
        return {
            speech: i.t("whack_game_begin"),
            reprompt: ""
        };
    }

    export function whack_bad_answer(): ILocalizationResult {
        return {
            speech: i.t("whack_game_bad_answer"),
            reprompt: ""
        };
    }

    export function whack_game_help(): ILocalizationResult {
        return {
            speech: i.t("whack_game_help"),
            reprompt: ""
        };
    }

    export function whack_game_cancel(): ILocalizationResult {
        return {
            speech: i.t("whack_game_cancel"),
            reprompt: ""
        };
    }
}

const i = i18next.init({
    lng: "en",
    debug: false,
    resources: {
        en: {
            translation: {
                "donotunderstand_speech": "I'm sorry, I didn't quite catch that.",
                "donotunderstand_reprompt": "Sorry, I didn't understand.",
                "goodbye": "Ok, good bye.",
                "welcome_speech": "Hello. Welcome to the games sample. Do you want to play a game?",
                "welcome_reprompt": "Do you want to play a game?",
                "rollcall_timeout_speech": "It seems you did not register any buttons. Do you want to retry?",
                "rollcall_timeout_reprompt": "Do you want to retry?",
                "rollcall_timeout_exit": "No response received. I'll exit for now.",
                "rollcall_done_speech": "Ok, two buttons registered. I'll exit for now.",
                "rollcall_start_speech": "This game requires {{num}} buttons. Press button one.",
                "rollcall_start_reprompt": "Please press button one.",
                "rollcall_checkin": "Great! {{num}} to go!",
                "whack_description": "In this game, I will randomly turn on one button for a random amount of time. "
                    + "Hit it beore it turns off. "
                    + "Don't hit black buttons! Ok. Press any button to get started.",
                "whack_start_button_prompt_reprompt": "Press any button to get started.",
                "whack_game_summary_good": "Great. {{rest}}",
                "whack_game_summary_bad": "Ok. {{rest}}",
                "whack_game_summary_speech":
                    "Your score was {{score}}! You had {{good}} good and {{bad}} bad answers. Would you like to play again?",
                "whack_game_summary_reprompt": "Would you like to play again?",
                "whack_game_begin": "Go!",
                "whack_game_turn_done": "Nice.",
                "whack_game_bad_answer": "ouch.",
                "whack_game_help": "Press any of the buttons that light up. Make sure you only press them once.",
                "whack_game_cancel": "Ok, no problem. We're done."
            }
        }
    }
});