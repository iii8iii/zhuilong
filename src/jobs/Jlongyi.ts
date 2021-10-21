import { bollTrend, kdjTrend, macdTrend } from "@iii8iii/analysts";
import { stockItem, zuoZtItem } from "@iii8iii/dfcfbot/dist/types";
import { MessagePort, parentPort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';
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
          let { zzt } = data;
          const stocks: stockItem[] = zzt.filter((v: zuoZtItem) => v.yfbt < 100000 && v.zs > 0);
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
      const wData = await getKlineData(code, 'W');
      if (wData && macdTrend(wData, 'UP', 2) && bollTrend(wData, 'UP', 2) && kdjTrend(wData)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
      codes.shift();
    }
    clearInterval(t);
  });
})();