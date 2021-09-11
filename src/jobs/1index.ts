import { parentPort } from "worker_threads";
import { analysts } from "@iii8iii/analysts";
import { dfcfBot } from "@iii8iii/dfcfbot";
import { getStockCode } from "./utils";
import { difference } from 'lodash';

(async () => {
	if (parentPort) {
		const qsStocks = await dfcfBot.getQsStocksInfo();
		const qsStocksCodes: string[] = getStockCode(qsStocks.filter(v => v.ltsz > 10 * 100000000 && v.p > 8 && v.nh));
		const ztStocksCodes = getStockCode(await dfcfBot.getZtStocksInfo());
		let codes = difference(qsStocksCodes, ztStocksCodes);
		console.log('qsStocksCodes', qsStocksCodes, qsStocksCodes.length);
		console.log('ztStocksCodes', ztStocksCodes, ztStocksCodes.length);
		console.log('codes', codes, codes.length);

		let result: string[] = [];
		for (const code of codes) {
			const WKdata = await dfcfBot.getKlineData(code, 'W');
			const DKdata = await dfcfBot.getKlineData(code, 'D');
			const STMdata = await dfcfBot.getKlineData(code, "60m");
			if (WKdata && analysts.macdTrend(WKdata)) {
				result.push(code);
			}
		}

		console.log('result:', result, result.length);

		parentPort.postMessage(codes);
	} else {
		process.exit(0);
	}
})();
