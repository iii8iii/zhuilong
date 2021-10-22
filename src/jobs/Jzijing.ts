import { macdTrend } from "@iii8iii/analysts";
import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';
import { Result, stockData } from '../types';

(async () => {
  let ports: MessagePort[] = [];
  let result: Result = { codes: [], zt: true };
  let codes: string[] = [];

  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to, from } = msg;
      if (to) {
        ports.push(to);
      }
      if (from) {
        from.on('message', async (data: stockData) => {
          let { zj } = data;
          codes = union(codes, getStockCode(zj));
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
    }, 5 * 1000);

    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      if (dData && macdTrend(dData, 'UP', 2)) {
        result.codes = union(result.codes, [code]);
      } else {
        result.codes = difference(result.codes, [code]);
      }
      codes.shift();
    }

    clearInterval(t);
  });
})();