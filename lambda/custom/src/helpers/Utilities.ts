export module Utilities {
    export function shuffle<T>(a: Array<T>): Array<T> {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    export function getRandomItem<T>(a: Array<T>): T {
        const idx = randInt(0, a.length - 1);
        return a[idx];
    }

    export function randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export const TIMEOUT_DEFAULT = 15000;
    export const DT_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";

}