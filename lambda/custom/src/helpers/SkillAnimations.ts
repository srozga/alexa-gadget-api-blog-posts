import { BasicAnimations, ComplexAnimations, COLORS } from "./Animations";
import { services } from "ask-sdk-model";
import { Utilities } from "./Utilities";

export module SkillAnimations {
    export function skillLaunch(): Array<services.gadgetController.LightAnimation> {
        return ComplexAnimations.SpectrumAnimation(5, ["white", "purple", "yellow"]);
    }

    export function rollCallInitialized(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.CrossFadeAnimation(1, "yellow", "black", 5000, 15000);
    }

    export function rollCallButtonSelected(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.SolidAnimation(1, "orange", 15000);
    }

    export function rollCallFinishedUnused(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.SolidAnimation(1, "black", 100);
    }

    export function rollCallFinishedSelected(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.BreatheAnimation(10, "yellow", 1000);
    }

    export function buttonUp(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.FadeOutAnimation(1, "blue", 200);
    }
    export function buttonDown(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.SolidAnimation(1, "black", 100);
    }

    export function expectInput(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.FadeOutAnimation(1, "yellow", 20000);
    }

    export function lightUpWhackaButton(timeout: number): Array<services.gadgetController.LightAnimation> {
        let colors = Object.keys(COLORS);
        colors.splice(colors.indexOf("black"), 1);
        let color = Utilities.getRandomItem(colors);
        return BasicAnimations.SolidAnimation(1, color, timeout);
    }
}