import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { Result, stockData } from '../types';
import { difference, union } from 'lodash';
import { getKlineData } from '@iii8iii/dfcfbot';
import { highClose, ljxt, macdTrend } from '@iii8iii/analysts';

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
          qs = qs.filter(item => item.p / 100 < 300);
          codes = getStockCode(qs);
        });
      }
    });
  }

  reRun(async () => {
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData) && macdTrend(dData, 'UP', 3) && ljxt(dData) && highClose(dData, 2.5)) {
        result.codes = union([code], result.codes);
      } else {
        result.codes = difference(result.codes, [code]);
      }
    }

    for (const port of ports) {
      if (result.codes.length) {
        port.postMessage(result);
      }
      result.codes = [];
    }
  });
})();