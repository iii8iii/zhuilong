import { MessagePort } from "worker_threads";
import { qsItem, ztItem, zuoZtItem } from "@iii8iii/dfcfbot/dist/types";

export interface Job { name: string, path: string, start: string, end?: Time, linkTo?: string[]; }
export interface Port { [x: string]: MessagePort; }
export interface Time { h: number, m: number, s?: number, ms?: number; }

export interface stockData { zt: ztItem[], zzt: zuoZtItem[], qs: qsItem[]; }