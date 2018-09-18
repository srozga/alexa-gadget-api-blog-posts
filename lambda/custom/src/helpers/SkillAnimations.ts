import { BasicAnimations, ComplexAnimations } from "./Animations";
import { services } from "ask-sdk-model";

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
        return BasicAnimations.SolidAnimation(1, "black", 5 * 1000);
    }

    export function rollCallFinishedSelected(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.BreatheAnimation(5, "yellow", 1000);
    }

    export function buttonUp(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.FadeOutAnimation(1, "blue", 200);
    }
    export function buttonDown(): Array<services.gadgetController.LightAnimation> {
        return BasicAnimations.SolidAnimation(1, "black", 100);
    }

}