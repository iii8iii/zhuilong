import { parentPort, MessagePort } from "worker_threads";
import { Result, stockData } from '../types';
import { getStockCode, reRun } from './utils';
(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { codes: [] };
  if (parentPort) {
    parentPort.on('message', msg => {
      const { from, to } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', (data: stockData) => {
          const { zj1 } = data;
          result.codes = getStockCode(zj1);
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