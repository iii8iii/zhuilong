import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { Result, stockData } from '../types';
import { getKlineData } from '@iii8iii/dfcfbot';
import { highClose, highOpen, ljxt, macdTrend } from '@iii8iii/analysts';
import { difference, union } from 'lodash';

(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { name: 'zl', codes: [] };

  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to, from } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', async (data: stockData) => {
          let { zl, zj3 } = data;
          zl = zl.filter(item => item.p < 300);
          zj3 = zj3.filter(item => item.p < 300);
          result.codes = union(getStockCode(zl), getStockCode(zj3));
        });
      }
    });
  }

  reRun(async () => {
    const { codes } = result;
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if ((wData && !macdTrend(wData)) || (dData && (!macdTrend(dData, 'UP', 3) || !highClose(dData, 2) || !ljxt(dData) || !highOpen(dData)))) {
        result.codes = difference(result.codes, [code]);
      }
    }
    for (const port of ports) {
      port.postMessage(result);
    }
  });
})();