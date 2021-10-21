import { bollTrend, kdjTrend, macdTrend } from "@iii8iii/analysts";
import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';
import { stockData } from '../types';

(async () => {
  let toPorts: MessagePort[] = [];
  let fromPorts: MessagePort[] = [];

  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to, from } = msg;
      if (to) {
        toPorts.push(to);
      }
      if (from) {
        from.on('message', async (data: stockData) => {
          let { zj } = data;
          codes = union(codes, getStockCode(zj));
        });

        fromPorts.push(from);
      }
    });
  }

  let result: string[] = [];
  let codes: string[] = [];


  reRun(async () => {
    let t = setInterval(async () => {
      if (result.length) {
        for (const port of toPorts) {
          port.postMessage(result);
        }
      }
    }, 1000);

    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      if (dData && macdTrend(dData, 'UP', 2) && bollTrend(dData, 'UP', 2) && kdjTrend(dData)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
      codes.shift();
    }

    clearInterval(t);
  });
})();