import { Time } from "./types";
import dayjs from 'dayjs';

export function msToEnd(endTime: Time = { h: 15, m: 0, s: 0, ms: 0 }) {
  let { h, m, s, ms } = endTime;
  const now = dayjs().valueOf();
  const end = dayjs().hour(h).minute(m).second(s || 0).millisecond(ms || 0).valueOf();
  return end > now ? end - now : 0;
}

export function inArray<T>(v: T, array: T[]) {
  for (const vlue of array) {
    if (vlue === v) {
      return true;
    }
  }
  return false;
}