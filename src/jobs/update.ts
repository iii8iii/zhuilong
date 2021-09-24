import { parentPort } from "worker_threads";
import { setInterval } from 'timers';
import { ready } from "./utils";
import { take, union } from 'lodash';

(async () => {
	//添加茅台，好在任务一启动时就先登录THS
	if (parentPort) {
		parentPort.postMessage(['600519']);
	}
	let codes: string[] = [];
	const ports = await ready(['UD2MR']);
	ports.UD2MR.on('message', (cs) => {
		codes = union(cs, codes);
	});
	setInterval(() => {
		if (codes.length > 10) {
			codes = take(codes, 10);
		}
		if (codes.length) {
			if (parentPort) {
				parentPort.postMessage(codes);
			}
		}
	}, 1500);
})();
