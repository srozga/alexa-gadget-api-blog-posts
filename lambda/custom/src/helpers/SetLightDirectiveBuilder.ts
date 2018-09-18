import { services, interfaces } from "ask-sdk-model";

export module SetLightDirectiveBuilder {
    export function setLight(animations: Array<services.gadgetController.LightAnimation>,
        targetGadgets?: string[],
        delayInMs?: number): interfaces.gadgetController.SetLightDirective {
        return setLightImpl(animations, "none", targetGadgets, delayInMs);
    }

    export function setLightOnButtonDown(animations: Array<services.gadgetController.LightAnimation>,
        targetGadgets?: string[],
        delayInMs?: number): interfaces.gadgetController.SetLightDirective {
        return setLightImpl(animations, "buttonDown", targetGadgets, delayInMs);
    }

    export function setLightOnButtonUp(animations: Array<services.gadgetController.LightAnimation>,
        targetGadgets?: string[],
        delayInMs?: number): interfaces.gadgetController.SetLightDirective {
        return setLightImpl(animations, "buttonUp", targetGadgets, delayInMs);
    }

    function setLightImpl(animations: Array<services.gadgetController.LightAnimation>,
        on: services.gadgetController.TriggerEventType,
        targetGadgets?: string[],
        delayInMs?: number): interfaces.gadgetController.SetLightDirective {
        const result: interfaces.gadgetController.SetLightDirective = {
            type: "GadgetController.SetLight",
            version: 1,
            targetGadgets: targetGadgets,
            parameters: {
                triggerEvent: on,
                triggerEventTimeMs: delayInMs,
                animations: animations
            }
        };
        return result;
    }
}