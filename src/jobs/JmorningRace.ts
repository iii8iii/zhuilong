import { difference, union } from 'lodash';
import { getKlineData } from "@iii8iii/dfcfbot";
import { macdTrend } from "@iii8iii/analysts";
import { qsItem } from "@iii8iii/dfcfbot/dist/types";
import { ready, getStockCode, sleep } from "./utils";
import { clearInterval, setInterval } from 'timers';

(async () => {
  const ports = await ready(['MR2GD', 'MR2UD']);
  let result: string[] = [];

  ports.MR2GD.on('message', async (data) => {
    let qs: qsItem[] = data.qs;
    qs = qs.filter(v => v.ltsz > 10 * 100000000 && v.p > 800);
    let t = setInterval(async () => {
      ports.MR2UD.postMessage(result);
    }, 500);

    for (const code of getStockCode(qs)) {
      const dData = await getKlineData(code, 'D');
      const wData = await getKlineData(code, 'W');

      if (dData && wData && macdTrend(wData) && macdTrend(dData)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
    }
    clearInterval(t);
  });
})();