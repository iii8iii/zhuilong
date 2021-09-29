import { difference, union, unionBy } from 'lodash';
import { getKlineData } from "@iii8iii/dfcfbot";
import { bollTrend, kdjTrend, macdTrend } from "@iii8iii/analysts";
import { qsItem } from "@iii8iii/dfcfbot/dist/types";
import { ready, getStockCode, run } from "./utils";
import { clearInterval, setInterval } from 'timers';

(async () => {
  const ports = await ready(['MR2GD', 'MR2UD']);
  let result: string[] = [];
  let qs: qsItem[] = [];

  ports["MR2GD"]?.on('message', async (data) => {
    qs = unionBy(qs, data.qs, 'c');
    qs = qs.filter(v => v.ltsz > 10 * 100000000 && v.p > 800);
  });

  run(async () => {
    let t = setInterval(async () => {
      if (result.length) {
        ports["MR2UD"]?.postMessage(result);
      }
    }, 1000);

    for (const code of getStockCode(qs)) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');
      if (dData && wData && macdTrend(wData) && bollTrend(wData) && macdTrend(dData) && bollTrend(dData) && kdjTrend(dData)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
      qs.shift();
    }
    clearInterval(t);
  });
})();