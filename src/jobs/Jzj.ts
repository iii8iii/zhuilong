import { highClose, highOpen, macdTrend } from '@iii8iii/analysts';
import { getKlineData } from '@iii8iii/dfcfbot';
import { difference } from 'lodash';
import { parentPort, MessagePort } from "worker_threads";
import { Result, stockData } from '../types';
import { getStockCode, reRun } from './utils';
(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { name: 'zj', codes: [] };
  if (parentPort) {
    parentPort.on('message', msg => {
      const { from, to } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', (data: stockData) => {
          let { zj1 } = data;
          zj1 = zj1.filter(item => item.p < 300);
          result.codes = getStockCode(zj1);
        });
      }
    });
  }

  reRun(async () => {
    const { codes } = result;
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if ((wData && !macdTrend(wData)) || (dData && (!macdTrend(dData, 'UP', 3) || !highOpen(dData) || !highClose(dData, 1)))) {
        result.codes = difference(result.codes, [code]);
      }
    }
    for (const port of ports) {
      port.postMessage(result);
    }
  });
})();