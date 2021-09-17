import { ready, delzt } from "./utils";
import { union, difference } from "lodash";
import { analysts } from "@iii8iii/analysts";
import { dfcfBot } from "@iii8iii/dfcfbot";
(async () => {
  const ports = await ready(['MA2DA', 'MA2UD']);
  let result: string[] = [];

  ports.MA2DA.on('message', async (cs) => {
    let t = setInterval(async () => {
      result = await delzt(result);
      ports.MA2UD.postMessage(result);
    }, 500);

    for (const code of cs) {
      const data = await dfcfBot.getKlineData(code, '60m');
      if (data && analysts.macdTrend(data)) {
        result = union(result, [code]);
      } else {
        result = difference(result, [code]);
      }
    }
    clearInterval(t);
  });
})();