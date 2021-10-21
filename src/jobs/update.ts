import { parentPort } from "worker_threads";
import { union } from "lodash";
import { delZt } from './utils';
import { Result } from "../types";

(async () => {
	let zx: string[] = [];
	if (parentPort) {
		parentPort.on('message', msg => {
			const { from } = msg;
			from.on('message', async (result: Result) => {
				let { zt, codes } = result;
				if (!zt) {
					codes = await delZt(codes);
				}
				zx = union(codes, zx);
				if (parentPort) {
					parentPort.postMessage(zx);
				}
				if (zx.length > 15) {
					zx.pop();
				}
			});
		});
	}
})();
