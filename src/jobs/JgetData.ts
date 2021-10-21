import { get5minZfStocks, getMoneyInStocks, getQsStocksInfo, getTpStocks, getZtStocksInfo, getZuoZtStocksInfo } from "@iii8iii/dfcfbot";
import { MessagePort, parentPort } from "worker_threads";
import { delTp, reRun } from "./utils";
import { stockData } from "../types";
import { unionBy } from 'lodash';

(async () => {
  const tp = await getTpStocks();

  let toPorts: MessagePort[] = [];
  if (parentPort) {
    parentPort.on('message', (msg) => {
      const { to } = msg;
      if (to) {
        toPorts.push(to);
      }
    });
  }

  let result: stockData = { zt: [], zzt: [], qs: [], zj: [], wfzf: [] };
  reRun(async () => {
    try {
      const zt = await getZtStocksInfo();
      result.zt = zt.length ? zt : result.zt;

      const zzt = await getZuoZtStocksInfo();
      result.zzt = zzt.length ? delTp(tp, zzt) : result.zzt;

      const qs = await getQsStocksInfo();
      result.qs = qs.length ? delTp(tp, qs) : result.qs;

      const zj1 = await getMoneyInStocks(1);
      const zj3 = await getMoneyInStocks(3);
      const zj5 = await getMoneyInStocks(5);
      const zj10 = await getMoneyInStocks(10);
      result.zj = delTp(tp, unionBy(zj1, zj3, zj5, zj10, 'c'));

      const wfzf = await get5minZfStocks();
      result.wfzf = wfzf.length ? delTp(tp, wfzf) : result.wfzf;

      for (const port of toPorts) {
        port.postMessage(result);
      }
    } catch (error) {
      console.log('error:', error);
    }
  }, 2 * 1000);
})();