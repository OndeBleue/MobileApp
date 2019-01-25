import log from "webpack-log";

import { LOG_LEVEL } from "./config.js"

export const apiLogger = log({ name: "api", level: LOG_LEVEL, timestamp: true });
export const uiLogger = log({ name: "ui", level: LOG_LEVEL });
