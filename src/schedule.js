import parser from 'cron-parser';
import moment from 'moment';
import { PROPAGATION_CRON, PROPAGATION_DURATION } from './config';
import { uiLogger } from "./logger";
import { saveError } from "./api";

export function nextOccurrence() {
  try {
    const interval = parser.parseExpression(PROPAGATION_CRON);
    return interval.next().toDate();
  } catch (error) {
    uiLogger.error('Failed to parse cron expression', error);
    saveError({ from: 'parse cron', error })
  }
}

export function previousOccurrence() {
  try {
    const interval = parser.parseExpression(PROPAGATION_CRON);
    return interval.prev().toDate();
  } catch (error) {
    uiLogger.error('Failed to parse cron expression', error);
    saveError({ from: 'parse cron', error })
  }
}

export function previousOccurrenceEnd() {
  return moment(previousOccurrence()).add(PROPAGATION_DURATION, 'm');
}

export function isRunning() {
  const start = moment(previousOccurrence());
  const end = moment(start).add(PROPAGATION_DURATION, 'm');
  return moment().isBetween(start, end);
}
