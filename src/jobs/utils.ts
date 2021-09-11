import { parentPort } from "worker_threads";
import { difference } from "lodash";
import { port } from "../types";

export const getStockCode = (data: { c: string; }[]) => {
  const stockCodes: string[] = [];
  data.forEach(item => stockCodes.push(item.c));
  return stockCodes;
};

export const ready = async (ports: string[]) => {
  let messagePorts: port = {};
  const p: Promise<void> = new Promise(resolve => {
    if (parentPort) {
      parentPort.on('message', msg => {
        ports = difference(ports, Object.keys(msg));
        messagePorts = Object.assign(messagePorts, msg);
        if (ports.length == 0) resolve();
      });
    }
  });

  await p;

  return messagePorts;
};