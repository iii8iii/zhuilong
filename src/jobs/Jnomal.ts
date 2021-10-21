import { bollTrend, kdjTrend, macdTrend } from "@iii8iii/analysts";
import { qsItem, stockItem } from "@iii8iii/dfcfbot/dist/types";
import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union, unionBy } from 'lodash';
import { stockData } from '../types';

(async () => {
  let ports: MessagePort[] = [];
  let result: string[] = [];
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
          qs = qs.filter((v: qsItem) => v.ltsz > 10 * 100000000 && v.p > 800);
          const stocks: stockItem[] = unionBy(qs, zj, wfzf, 'c');
          codes = union(codes, getStockCode(stocks));
        });
      }
    });
  }

  reRun(async () => {
    let t = setInterval(async () => {
      if (result.length) {
        for (const port of ports) {
          port.postMessage(result);
        }
      }
    }, 1000);

    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData, 'UP', 2) && bollTrend(wData, 'UP', 2) && kdjTrend(wData) && macdTrend(dData, 'UP', 2) && bollTrend(dData, 'UP', 2) && kdjTrend(dData)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
      codes.shift();
    }

    clearInterval(t);
  });
})();