import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { difference, take, union, unionBy } from 'lodash';
import { Result, stockData } from '../types';
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
          let { zj1, zj3, zj5, zj10 } = data;
          const zj = unionBy(zj3, zj5, zj1, zj10, 'c');
          codes = union(getStockCode(zj), codes);
        });
      }
    });
  }

  reRun(async () => {
    codes = take(codes, 100);
    for (const code of codes) {
      const wData = await getKlineData(code, 'W');
      const dData = await getKlineData(code, 'D');
      if (wData && dData && macdTrend(wData) && macdTrend(dData)) {
        result.codes = union([code], result.codes);
      } else {
        result.codes = difference(result.codes, [code]);
      }
    }
    for (const port of ports) {
      port.postMessage(result);
    }
    result.codes = [];
  });
})();