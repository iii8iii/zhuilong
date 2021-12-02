import { highClose, highOpen, ljxt, macdTrend } from '@iii8iii/analysts';
import { parentPort, MessagePort } from "worker_threads";
import { getKlineData } from '@iii8iii/dfcfbot';
import { difference, union } from 'lodash';
import { Result, stockData } from '../types';
import { getStockCode, reRun } from './utils';
(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { name: 'ly', codes: [] };
  let codes: string[] = [];
  if (parentPort) {
    parentPort.on('message', msg => {
      const { from, to } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', (data: stockData) => {
          let { ly } = data;
          codes = getStockCode(ly);
        });
      }
    });
  }

  reRun(async () => {
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      if (dData && macdTrend(dData, 'UP', 3) && !ljxt(dData) && highClose(dData, 2) && !highOpen(dData)) {
        result.codes = union(result.codes, [code]);
      } else {
        result.codes = difference(result.codes, [code]);
      }
    }
    for (const port of ports) {
      if (result.codes.length) {
        port.postMessage(result);
      }
      result.codes = [];
    }
  });
})();