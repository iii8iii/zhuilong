import { ready, getStockCode, delzt } from "./utils";
import { clearInterval, setInterval } from 'timers';
import { macdTrend } from "@iii8iii/analysts";
import { getQsStocksInfo, getKlineData } from "@iii8iii/dfcfbot";
import { difference, union } from 'lodash';

(async () => {
	const ports = await ready(['WA2DA']);
	let result: string[] = [];

	do {
		let t = setInterval(async () => {
			result = await delzt(result);
			ports.WA2DA.postMessage(result);
		}, 500);

		try {
			const qsStocks = await getQsStocksInfo();
			const qsStocksCodes: string[] = getStockCode(qsStocks.filter(v => v.ltsz > 10 * 100000000 && v.p / 100 > 8));
			const codes = await delzt(qsStocksCodes);

			for (const code of codes) {
				const data = await getKlineData(code, 'W');
				if (data && macdTrend(data)) {
					result = union(result, [code]);
				} else {
					result = difference(result, [code]);
				}
			}
		} catch (error) {
			console.log('error:', error);
		}

		clearInterval(t);
	} while (true);
})();