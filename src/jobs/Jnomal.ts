import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { getKlineData } from "@iii8iii/dfcfbot";
import { take, union } from 'lodash';
import { Result, stockData } from '../types';
import { bollTrend, kdjTrend, macdTrend } from '@iii8iii/analysts';

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
          qs = qs.filter(v => v.nh);
          codes = union(getStockCode(qs), codes);
        });
      }
    });
  }

  reRun(async () => {
    codes = take(codes, 100);
    for (const code of codes) {
      const wData = await getKlineData(code, 'W');
      if (wData && macdTrend(wData, 'UP', 2) && kdjTrend(wData) && bollTrend(wData)) {
        result.codes.push(code);
      }
    }
    for (const port of ports) {
      port.postMessage(result);
    }
    result.codes = [];
  });
})();