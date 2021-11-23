import { parentPort, MessagePort } from "worker_threads";
import { Result, stockData } from '../types';
import { getStockCode, reRun } from './utils';
(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { name: 'ly', codes: [] };
  if (parentPort) {
    parentPort.on('message', msg => {
      const { from, to } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', (data: stockData) => {
          let { ly } = data;
          ly = ly.filter(item => item.zdp > 2);
          result.codes = getStockCode(ly);
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