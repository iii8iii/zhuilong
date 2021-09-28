import { getQsStocksInfo, getZtStocksInfo, getZuoZtStocksInfo } from "@iii8iii/dfcfbot";
import { clearInterval, setInterval } from 'timers';
import { ready, delzt, sleep } from "./utils";
import { stockData } from "../types";

(async () => {
  //you need to add you port to the array as argment of ready
  //you can make sure the ports are ready to finish the fllowing jobs by doing this
  const ports = await ready(['GD2MR']);
  let result: stockData = { zt: [], zzt: [], qs: [] };
  do {
    const TpostMsg = setInterval(async () => {
      ports["GD2MR"]?.postMessage(result);
    }, 500);

    try {
      const zt = await getZtStocksInfo();
      result.zt = zt.length ? zt : result.zt;
      const zzt = await getZuoZtStocksInfo();
      result.zzt = zzt.length ? delzt(zt, zzt) : result.zzt;
      const qs = await getQsStocksInfo(300);
      result.qs = qs.length ? delzt(zt, qs) : result.qs;
    } catch (error) {
      console.log('error:', error);
    }

    //finish the loop and have a rest before next loop
    await sleep();
    clearInterval(TpostMsg);
  } while (true);
})();