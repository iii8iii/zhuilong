import { jeItem, lyItem, qsItem, stockItem, zlItem, ztItem, zuoZtItem } from "@iii8iii/dfcfbot/dist/types";
import { MessagePort } from "worker_threads";

export interface Job { name: string, path: string, start: string, end?: Time, link?: string[]; }
export interface Time { h: number, m: number, s?: number, ms?: number; }

export interface stockData { zt: ztItem[], zzt: zuoZtItem[], qs: qsItem[], zj1: jeItem[], zj3: jeItem[], zj5: jeItem[], zj10: jeItem[], wfzf: stockItem[], zl: zlItem[], ly: lyItem[]; }

export interface Port { [x: string]: MessagePort; }

export interface msg { codes: string[], time: number; }

export interface Result {
  name: string,
  codes: string[],
  zt?: boolean,
}