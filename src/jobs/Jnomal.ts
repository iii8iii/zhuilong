import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { take, union } from 'lodash';
import { Result, stockData } from '../types';

(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { codes: [], zt: true };
  let codes: string[] = [];

  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to, from } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', async (data: stockData) => {
          let { zl } = data;
          codes = union(getStockCode(zl), codes);
        });
      }
    });
  }

  reRun(async () => {
    result.codes = take(codes, 50);
    for (const port of ports) {
      port.postMessage(result);
    }
    result.codes = [];
  });
})();