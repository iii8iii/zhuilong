import { parentPort } from "worker_threads";
import { difference, union } from "lodash";
import { delZt, reRun } from './utils';
import { Result } from "../types";

(async () => {
	let zx: string[] = [];
	let records: string[][] = [];
	if (parentPort) {
		parentPort.on('message', msg => {
			const { from } = msg;
			from.on('message', async (result: Result) => {
				let { name, zt, codes } = result;

				if (!zt) {
					codes = await delZt(codes);
				}

				let lastCodes = records[name as keyof object] || [];
				records[name as keyof object] = codes;
				zx = difference(union(codes, zx), difference(lastCodes, codes));
			});
		});
	}

	reRun(async () => {
		if (parentPort) {
			parentPort.postMessage(zx);
		}
	});
})();
