import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { Result, stockData } from '../types';

(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { codes: [] };

  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to, from } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', async (data: stockData) => {
          let { zl } = data;
          zl = zl.filter(zl => zl.zdp > 3);
          result.codes = getStockCode(zl);
        });
      }
    });
  }

  reRun(async () => {
    for (const port of ports) {
      port.postMessage(result);
    }
  });
})();