import parser from 'cron-parser';
import moment from 'moment';
import { PROPAGATION_CRON, PROPAGATION_DURATION } from './config';
import { uiLogger } from "./logger";
import { saveError } from "./api";

export function nextOccurrence() {
  try {
    const interval = parser.parseExpression(PROPAGATION_CRON);
    return interval.next();
  } catch (error) {
    uiLogger.error('Failed to parse cron expression', error);
    saveError({ from: 'parse cron', error })
  }
}

export function isRunning() {
  const start = moment(nextOccurrence());
  const end = start.add(PROPAGATION_DURATION, 'm');
  return moment().isBetween(start, end);
}
