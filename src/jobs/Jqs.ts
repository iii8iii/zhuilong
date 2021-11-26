import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { Result, stockData } from '../types';
import { difference, union } from 'lodash';
import { getKlineData } from '@iii8iii/dfcfbot';
import { highClose, highOpen, macdTrend } from '@iii8iii/analysts';

(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { name: 'qs', codes: [] };
  let codes: string[] = [];
  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to, from } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', async (data: stockData) => {
          let { qs } = data;
          qs = qs.filter(item => item.zdp > 5 && item.nh && item.p < 300);
          codes = getStockCode(qs);
        });
      }
    });
  }

  reRun(async () => {
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData) && macdTrend(dData) && highOpen(dData) && highClose(dData)) {
        result.codes = union([code], result.codes);
      } else {
        result.codes = difference(result.codes, [code]);
      }
    }

    for (const port of ports) {
      port.postMessage(result);
    }
  });
})();