import { ready, getStockCode, delzt } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { analysts } from "@iii8iii/analysts";
import { dfcfBot } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';

(async () => {
	const ports = await ready(['WA2DA']);
	let result: string[] = [];

	do {
		let t = setInterval(async () => {
			result = await delzt(result);
			ports.WA2DA.postMessage(result);
		}, 1000);

		const qsStocks = await dfcfBot.getQsStocksInfo(300);
		const qsStocksCodes: string[] = getStockCode(qsStocks.filter(v => v.ltsz > 10 * 100000000 && v.p / 100 > 8 && v.nh));
		const codes = await delzt(qsStocksCodes);
		for (const code of codes) {
			const data = await dfcfBot.getKlineData(code, 'W');
			if (data && analysts.macdTrend(data)) {
				result = union(result, [code]);
			} else {
				result = difference(result, [code]);
			}
		}
		clearInterval(t);
	} while (true);
})();