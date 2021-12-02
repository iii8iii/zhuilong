import { highClose, highOpen, ljxt, macdTrend } from '@iii8iii/analysts';
import { getKlineData } from '@iii8iii/dfcfbot';
import { difference } from 'lodash';
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
          result.codes = getStockCode(ly);
        });
      }
    });
  }

  reRun(async () => {
    const { codes } = result;
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      if (dData && (!macdTrend(dData, 'UP', 3) || !highClose(dData, 2) || !ljxt(dData) || !highOpen(dData))) {
        result.codes = difference(result.codes, [code]);
      }
    }
    for (const port of ports) {
      port.postMessage(result);
    }
  });
})();