// heavily based off: https://raw.githubusercontent.com/alexa/skill-sample-nodejs-buttons-trivia/master/lambda/custom/utils/animations.js
// translated into TypeScript
/*
* Copyright 2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
* Licensed under the Amazon Software License (the "License").
* You may not use this file except in compliance with the License.
* A copy of the License is located at
* http://aws.amazon.com/asl/
* or in the "license" file accompanying this file. This file is distributed
* on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the License for the specific language governing
* permissions and limitations under the License.
*/
import { services } from "ask-sdk-model";

export const COLORS: { [key: string]: string } = {
    "white": "ffffff",
    "red": "ff0000",
    "orange": "ff3300",
    "green": "00ff00",
    "dark green": "004411",
    "blue": "0000ff",
    "light blue": "00a0b0",
    "purple": "4b0098",
    "yellow": "ffd400",
    "black": "000000"
};

const ColorHelper = {
    getColor: function (colorName: string): string {
        if (COLORS[colorName.toLowerCase()]) {
            return COLORS[colorName.toLowerCase()];
        }
        console.log("# WARN # UNKNOWN COLOR: " + colorName);
        return "000000"; // default response
    },
    validateColor: function (requestedColor: string): string {
        var color = requestedColor || "";
        if (color.indexOf("0x") === 0) {
            return color.substring(2);
        } else if (color.indexOf("#") === 0) {
            return color.substring(1);
        } else {
            return ColorHelper.getColor(color) || color;
        }
    }
};
export module BasicAnimations {
    export function SolidAnimation(cycles: number, color: string, duration: number): Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": duration,
                        "blend": false,
                        "color": ColorHelper.validateColor(color)
                    }
                ]
            }
        ];
    }
    export function FadeInAnimation(cycles: number, color: string, duration: number): Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": 1,
                        "blend": true,
                        "color": "000000"
                    }, {
                        "durationMs": duration,
                        "blend": true,
                        "color": ColorHelper.validateColor(color)
                    }
                ]
            }
        ];
    }
    export function FadeOutAnimation(cycles: number, color: string, duration: number): Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": duration,
                        "blend": true,
                        "color": ColorHelper.validateColor(color)
                    }, {
                        "durationMs": 1,
                        "blend": true,
                        "color": "000000"
                    }
                ]
            }
        ];
    }
    export function CrossFadeAnimation(cycles: number, colorOne: string, colorTwo: string,
        durationOne: number, durationTwo: number): Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": durationOne,
                        "blend": true,
                        "color": ColorHelper.validateColor(colorOne)
                    }, {
                        "durationMs": durationTwo,
                        "blend": true,
                        "color": ColorHelper.validateColor(colorTwo)
                    }
                ]
            }
        ];
    }
    export function BreatheAnimation(cycles: number, color: string, duration: number): Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": 1,
                        "blend": true,
                        "color": "000000"
                    },
                    {
                        "durationMs": duration,
                        "blend": true,
                        "color": ColorHelper.validateColor(color)
                    },
                    {
                        "durationMs": 300,
                        "blend": true,
                        "color": ColorHelper.validateColor(color)
                    },
                    {
                        "durationMs": 300,
                        "blend": true,
                        "color": "000000"
                    }
                ]
            }
        ];
    }
    export function BlinkAnimation(cycles: number, color: string): Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": 500,
                        "blend": false,
                        "color": ColorHelper.validateColor(color)
                    }, {
                        "durationMs": 500,
                        "blend": false,
                        "color": "000000"
                    }
                ]
            }
        ];
    }
    export function FlipAnimation(cycles: number, colorOne: string, colorTwo: string, durationOne: number, durationTwo: number)
        : Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": durationOne,
                        "blend": false,
                        "color": ColorHelper.validateColor(colorOne)
                    }, {
                        "durationMs": durationTwo,
                        "blend": false,
                        "color": ColorHelper.validateColor(colorTwo)
                    }
                ]
            }
        ];
    }
    export function PulseAnimation(cycles: number, colorOne: string, colorTwo: string)
        : Array<services.gadgetController.LightAnimation> {
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": [
                    {
                        "durationMs": 500,
                        "blend": true,
                        "color": ColorHelper.validateColor(colorOne)
                    }, {
                        "durationMs": 1000,
                        "blend": true,
                        "color": ColorHelper.validateColor(colorTwo)
                    }
                ]
            }
        ];
    }
}

export module ComplexAnimations {
    export function AnswerAnimation(correct_color: string, baseline_color: string, duration: number)
        : Array<services.gadgetController.LightAnimation> {
        // blink correct color for 3 seconds
        let colorSequence = [];
        for (let i = 0; i < 3; i++) {
            colorSequence.push({
                "durationMs": 500,
                "color": ColorHelper.validateColor(correct_color),
                "blend": false
            });
            colorSequence.push({
                "durationMs": 500,
                "color": ColorHelper.validateColor("black"),
                "blend": false
            });
        }
        colorSequence.push({
            "durationMs": duration,
            "color": ColorHelper.validateColor(baseline_color),
            "blend": false
        });
        return [
            {
                "repeat": 1,
                "targetLights": ["1"],
                "sequence": colorSequence
            }
        ];
    }
    export function SpectrumAnimation(cycles: number, color: string[]): Array<services.gadgetController.LightAnimation> {
        let colorSequence = [];
        for (let i = 0; i < color.length; i++) {

            colorSequence.push({
                "durationMs": 400,
                "color": ColorHelper.validateColor(color[i]),
                "blend": true
            });
        }
        return [
            {
                "repeat": cycles,
                "targetLights": ["1"],
                "sequence": colorSequence
            }
        ];
    }
}