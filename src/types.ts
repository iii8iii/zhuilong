import { MessagePort } from "worker_threads";

export interface Job { name: string, path: string, start: string, end?: Time, linkTo?: string[]; }
export interface Port { [x: string]: MessagePort; }
export interface Time { h: number, m: number, s: number, ms: number; }