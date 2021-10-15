import { bollTrend, kdjTrend, macdTrend } from "@iii8iii/analysts";
import { stockItem, zuoZtItem } from "@iii8iii/dfcfbot/dist/types";
import { getStockCode, ready, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';
import { stockData } from '../types';

(async () => {
  const ports = await ready(['LY2GD', 'LY2UD']);
  let result: string[] = [];
  let codes: string[] = [];

  ports["LY2GD"]?.on('message', async (data: stockData) => {
    let { zzt } = data;
    const stocks: stockItem[] = zzt.filter((v: zuoZtItem) => v.yfbt < 100000 && v.zs > 0);
    codes = union(codes, getStockCode(stocks));
  });

  reRun(async () => {
    let t = setInterval(async () => {
      if (result.length) {
        ports["LY2UD"]?.postMessage(result);
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