import { parentPort } from "worker_threads";
import { concat, difference, union, without } from "lodash";
import { delZt } from './utils';
import { Result } from "../types";

(async () => {
	let zx: string[] = [];
	let toDels: string[] = [];
	let dels: string[] = [];
	if (parentPort) {
		parentPort.on('message', msg => {
			const { from } = msg;
			from.on('message', async (result: Result) => {
				let { zt, codes } = result;

				if (!zt) {
					codes = await delZt(codes);
				}

				toDels = concat(without(toDels, ...codes), difference(zx, codes));
				for (const toDel of toDels) {
					if (toDels.filter(v => v === toDel).length >= 5) {
						dels = union(dels, [toDel]);
					}
				}
				toDels = without(toDels, ...dels);

				zx = difference(union(codes, zx), dels);

				if (parentPort) {
					parentPort.postMessage(zx);
				}
			});
		});
	}
})();
