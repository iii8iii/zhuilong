import { parentPort } from "worker_threads";
import { setInterval } from 'timers';
import { ready } from "./utils";
import { take, union } from 'lodash';

(async () => {
	let codes: string[] = [];
	const ports = await ready(['UD2MA']);
	ports.UD2MA.on('message', (cs) => {
		codes = union(cs, codes);
	});
	setInterval(() => {
		if (codes.length > 15) {
			codes = take(codes, 15);
		}
		if (codes.length) {
			if (parentPort) {
				parentPort.postMessage(codes);
			}
		}
	}, 5000);
})();
