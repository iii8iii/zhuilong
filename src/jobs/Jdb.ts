import { getLyStocks, getMoneyInStocks, getQsStocksInfo, getTpStocks, getZlStocks } from "@iii8iii/dfcfbot";
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

  let result: stockData = { zt: [], zzt: [], qs: [], zj1: [], zj3: [], zj5: [], zj10: [], wfzf: [], zl: [], ly: [] };
  reRun(async () => {
    try {

      const zj1 = await getMoneyInStocks(1);
      result.zj1 = zj1.length ? delTp(tp, zj1) : result.zj1;

      const zl = await getZlStocks();
      result.zl = zl.length ? delTp(tp, zl) : result.zl;

      const ly = await getLyStocks();
      result.ly = ly.length ? delTp(tp, ly) : result.ly;

      const qs = await getQsStocksInfo();
      result.qs = qs.length ? delTp(tp, qs) : result.qs;


      for (const port of toPorts) {
        port.postMessage(result);
      }
    } catch (error) {
      console.log('error:', error);
    }
  });
})();