import { parentPort } from "worker_threads";
import { setInterval } from 'timers';
import { ready } from "./utils";
import { union } from 'lodash';

(async () => {
	let codes: string[] = [];
	const ports = await ready(['UD2MR']);
	ports["UD2MR"]?.on('message', (cs) => {
		codes = union(cs, codes);
	});
	setInterval(() => {
		if (parentPort) {
			parentPort.postMessage(codes);
		}
	}, 5000);
})();
