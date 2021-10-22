import { bollTrend, macdTrend } from "@iii8iii/analysts";
import { stockItem } from "@iii8iii/dfcfbot/dist/types";
import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union, unionBy } from 'lodash';
import { Result, stockData } from '../types';

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
          let { qs, zj, wfzf } = data;
          const stocks: stockItem[] = unionBy(qs, zj, wfzf, 'c');
          codes = union(codes, getStockCode(stocks));
        });
      }
    });
  }

  reRun(async () => {
    let t = setInterval(async () => {
      if (result.codes.length) {
        for (const port of ports) {
          port.postMessage(result);
        }
      }
    }, 15 * 1000);

    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData, 'UP', 2) && bollTrend(wData, 'UP', 3) && macdTrend(dData, 'DOWN')) {
        result.codes = union(result.codes, [code]);
      } else {
        result.codes = difference(result.codes, [code]);
      }
      codes.shift();
    }

    clearInterval(t);
  });
})();