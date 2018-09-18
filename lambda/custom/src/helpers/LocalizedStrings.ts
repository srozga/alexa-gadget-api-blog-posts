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

    export function rollcall_start(): ILocalizationResult {
        return {
            speech: i.t("rollcall_start_speech"),
            reprompt: i.t("rollcall_start_reprompt")
        };
    }

    export function rollcall_checkin(num: number): ILocalizationResult {
        return {
            speech: i.t("rollcall_checkin", { num: num }),
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
                "rollcall_start_speech": "Let's get going. Press button one.",
                "rollcall_start_reprompt": "Please press button one.",
                "rollcall_checkin": "Great! {{num}} to go!"
            }
        }
    }
});