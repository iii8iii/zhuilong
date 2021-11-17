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
          let { qs } = data;
          qs = qs.filter(item => item.zdp > 3 && item.nh);
          result.codes = getStockCode(qs);
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