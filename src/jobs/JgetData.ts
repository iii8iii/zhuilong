import { get5minZfStocks, getMoneyInStocks, getQsStocksInfo, getZtStocksInfo, getZuoZtStocksInfo } from "@iii8iii/dfcfbot";
import { ready, delzt, reRun } from "./utils";
import { stockData } from "../types";
import { union } from 'lodash';

(async () => {
  //you need to add you port to the array as argment of ready
  //you can make sure the ports are ready to finish the fllowing jobs by doing this
  const ports = await ready(['GD2MR']);
  let result: stockData = { zt: [], zzt: [], qs: [], zj: [], wfzf: [] };
  reRun(async () => {
    try {
      const zt = await getZtStocksInfo();
      result.zt = zt.length ? zt : result.zt;

      const zzt = await getZuoZtStocksInfo();
      result.zzt = zzt.length ? delzt(zt, zzt) : result.zzt;

      const qs = await getQsStocksInfo();
      result.qs = qs.length ? delzt(zt, qs) : result.qs;

      const zj1 = await getMoneyInStocks(1);
      const zj3 = await getMoneyInStocks(3);
      const zj5 = await getMoneyInStocks(5);
      const zj10 = await getMoneyInStocks(10);
      result.zj = delzt(zt, union(zj1, zj3, zj5, zj10));

      const wfzf = await get5minZfStocks();
      result.wfzf = wfzf.length ? delzt(zt, wfzf) : result.wfzf;

      ports["GD2MR"]?.postMessage(result);
    } catch (error) {
      console.log('error:', error);
    }
  }, 2 * 1000);
})();