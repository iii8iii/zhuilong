import { bollTrend, kdjTrend, macdTrend } from "@iii8iii/analysts";
import { qsItem, stockItem } from "@iii8iii/dfcfbot/dist/types";
import { getStockCode, ready, reRun } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { getKlineData } from "@iii8iii/dfcfbot";
import { difference, union, unionBy } from 'lodash';
import { stockData } from '../types';

(async () => {
  const ports = await ready(['MR2GD', 'MR2UD']);
  let result: string[] = [];
  let codes: string[] = [];

  ports["MR2GD"]?.on('message', async (data: stockData) => {
    let { qs, zj, wfzf } = data;
    qs = qs.filter((v: qsItem) => v.ltsz > 10 * 100000000 && v.p > 800);
    const stocks: stockItem[] = unionBy(qs, zj, wfzf, 'c');
    codes = union(codes, getStockCode(stocks));
  });

  reRun(async () => {
    let t = setInterval(async () => {
      if (result.length) {
        ports["MR2UD"]?.postMessage(result);
      }
    }, 1000);
    for (const code of codes) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData) && bollTrend(wData) && macdTrend(dData) && bollTrend(dData) && kdjTrend(dData)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
      codes.shift();
    }
    clearInterval(t);
  });
})();