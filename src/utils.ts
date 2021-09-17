import { Time } from "./types";
import dayjs from 'dayjs';

export function msToEnd(endTime: Time = { h: 15, m: 0, s: 0, ms: 0 }) {
  const { h, m, s, ms } = endTime;
  const now = dayjs().valueOf();
  const end = dayjs().hour(h).minute(m).second(s).millisecond(ms).valueOf();
  return end > now ? end - now : 0;
}