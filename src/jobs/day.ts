import { analysts } from "@iii8iii/analysts";
import { dfcfBot } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';
import { ready, delzt } from "./utils";
import { clearInterval } from 'timers';

(async () => {
  const ports = await ready(['DA2WA', 'DA2MA']);
  let result: string[] = [];

  ports.DA2WA.on('message', async (cs) => {
    let t = setInterval(async () => {
      result = await delzt(result);
      ports.DA2MA.postMessage(result);
    }, 1000);

    for (const code of cs) {
      const data = await dfcfBot.getKlineData(code, 'D');
      if (data && analysts.macdTrend(data)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
    }
    clearInterval(t);
  });
})();