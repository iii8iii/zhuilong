import { qsItem, stockItem, ztItem, zuoZtItem } from "@iii8iii/dfcfbot/dist/types";
import { MessagePort } from "worker_threads";

export interface Job { name: string, path: string, start: string, end?: Time, link?: string[]; }
export interface Time { h: number, m: number, s?: number, ms?: number; }

export interface stockData { zt: ztItem[], zzt: zuoZtItem[], qs: qsItem[], zj1: stockItem[], zj3: stockItem[], zj5: stockItem[], zj10: stockItem[], wfzf: stockItem[]; }

export interface Port { [x: string]: MessagePort; }

export interface Result {
  codes: string[];
  zt?: boolean,
}