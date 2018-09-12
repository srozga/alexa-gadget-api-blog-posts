import { SkillBuilders } from "ask-sdk-core";

import { BuiltinAmazonCancelHandler } from "./handlers/builtin/AMAZON.CANCEL";
import { BuiltinAmazonHelpHandler } from "./handlers/builtin/AMAZON.Help";
import { BuiltinAmazonStopHandler } from "./handlers/builtin/AMAZON.Stop";
import { BuiltinAmazonYesNoHandler } from "./handlers/builtin/AMAZON.YesNo";
import { LaunchHandler } from "./handlers/Launch";
import { InLaunchStateHandler } from "./handlers/InLaunchState";
import { SessionEndedHandler } from "./handlers/SessionEndedRequst";
import { RollCallHandler } from "./handlers/RollCall";
import { RollCallTimeoutRetryHandler } from "./handlers/RollCallTimeoutRetry";

import { CustomErrorHandler } from "./handlers/Error";
import { RequestLoggingInterceptor } from "./interceptors/RequestLogging";
import { ResponseLoggingInterceptor } from "./interceptors/ResponseLogging";

function buildLambdaSkill(): any {
    return SkillBuilders.custom()
        .addRequestHandlers(
            new LaunchHandler(),
            new InLaunchStateHandler(),
            new RollCallHandler(),
            new RollCallTimeoutRetryHandler(),
            new BuiltinAmazonCancelHandler(),
            new BuiltinAmazonHelpHandler(),
            new BuiltinAmazonStopHandler(),
            new BuiltinAmazonYesNoHandler(),
            new SessionEndedHandler()
        )
        .addRequestInterceptors(new RequestLoggingInterceptor())
        .addResponseInterceptors(new ResponseLoggingInterceptor())
        .addErrorHandlers(new CustomErrorHandler())
        .lambda();
}

export let handler = buildLambdaSkill();