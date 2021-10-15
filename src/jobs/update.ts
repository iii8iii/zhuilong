import { parentPort } from "worker_threads";
import { setInterval } from 'timers';
import { ready } from "./utils";
import { union } from 'lodash';

(async () => {
	let codes: string[] = [];
	const ports = await ready(['UD2LY', 'UD2NM', 'UD2ZJ']);
	ports["UD2LY"]?.on('message', (cs) => {
		codes = union(cs, codes);
	});
	ports["UD2NM"]?.on('message', (cs) => {
		codes = union(cs, codes);
	});
	ports["UD2ZJ"]?.on('message', (cs) => {
		codes = union(cs, codes);
	});
	setInterval(() => {
		if (parentPort) {
			parentPort.postMessage(codes);
		}
		codes.pop();
	}, 60 * 1000);
})();
