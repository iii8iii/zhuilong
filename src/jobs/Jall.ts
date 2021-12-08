import { parentPort, MessagePort } from "worker_threads";
import { getStockCode, reRun } from "./utils";
import { Result, stockData } from '../types';
import { difference, union } from 'lodash';
import { getKlineData } from '@iii8iii/dfcfbot';
import { highClose, ljxt } from '@iii8iii/analysts';

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
          let { zj1, ly, qs } = data;
          zj1 = zj1.filter(item => item.p / 100 < 300);
          qs = qs.filter(item => item.p < 300);
          codes = union(getStockCode(zj1), getStockCode(ly), getStockCode(qs));
        });
      }
    });
  }

  reRun(async () => {
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      if (dData && ljxt(dData) && highClose(dData, 3)) {
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