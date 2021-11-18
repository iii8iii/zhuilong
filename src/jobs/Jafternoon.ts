import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { Result, stockData } from '../types';
import { difference, take, union } from 'lodash';
import { getKlineData } from '@iii8iii/dfcfbot';
import { macdTrend } from '@iii8iii/analysts';

(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { codes: [] };
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
          qs = qs.filter(item => item.zdp > 3 && item.nh);
          codes = union(getStockCode(qs), codes);
        });
      }
    });
  }

  reRun(async () => {
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData) && macdTrend(dData)) {
        result.codes = union([code], result.codes);
      } else {
        result.codes = difference(result.codes, [code]);
      }
    }

    result.codes = take(result.codes, 50);
    for (const port of ports) {
      port.postMessage(result);
    }
  });
})();