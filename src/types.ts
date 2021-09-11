import { MessagePort } from "worker_threads";
export interface job { name: string, path: string, interval: string, from?: string, to?: string, linkTo?: string[]; }
export interface port { [x: string]: MessagePort; }