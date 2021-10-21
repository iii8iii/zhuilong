import { parentPort } from "worker_threads";
import { setInterval } from 'timers';
import { delZt } from './utils';
import { union } from 'lodash';

(async () => {
	let codes: string[] = [];

	if (parentPort) {
		parentPort.on('message', msg => {
			const { from } = msg;
			from.on('message', (cs: string[]) => {
				codes = union(cs, codes);
			});
		});
	}

	setInterval(async () => {
		if (parentPort) {
			codes = await delZt(codes);
			parentPort.postMessage(codes);
		}
	}, 10 * 1000);
})();
