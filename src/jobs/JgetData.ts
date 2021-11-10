import { get5minZfStocks, getMoneyInStocks, getQsStocksInfo, getTpStocks, getZlStocks, getZtStocksInfo, getZuoZtStocksInfo } from "@iii8iii/dfcfbot";
import { MessagePort, parentPort } from "worker_threads";
import { delTp, reRun } from "./utils";
import { stockData } from "../types";

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

  let result: stockData = { zt: [], zzt: [], qs: [], zj1: [], zj3: [], zj5: [], zj10: [], wfzf: [], zl: [] };
  reRun(async () => {
    try {
      const zt = await getZtStocksInfo();
      result.zt = zt.length ? zt : result.zt;

      const zzt = await getZuoZtStocksInfo();
      result.zzt = zzt.length ? delTp(tp, zzt) : result.zzt;

      const qs = await getQsStocksInfo();
      result.qs = qs.length ? delTp(tp, qs) : result.qs;

      const zj1 = await getMoneyInStocks(1);
      result.zj1 = zj1.length ? delTp(tp, zj1) : result.zj1;

      const zj3 = await getMoneyInStocks(3);
      result.zj3 = zj1.length ? delTp(tp, zj3) : result.zj3;

      const zj5 = await getMoneyInStocks(5);
      result.zj5 = zj1.length ? delTp(tp, zj5) : result.zj5;

      const zj10 = await getMoneyInStocks(10);
      result.zj10 = zj1.length ? delTp(tp, zj10) : result.zj10;

      const wfzf = await get5minZfStocks();
      result.wfzf = wfzf.length ? delTp(tp, wfzf) : result.wfzf;

      const zl = await getZlStocks();
      result.zl = zl.length ? delTp(tp, zl) : result.zl;

      for (const port of toPorts) {
        port.postMessage(result);
      }
    } catch (error) {
      console.log('error:', error);
    }
  });
})();