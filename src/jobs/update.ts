import { parentPort } from "worker_threads";
import { setInterval } from 'timers';
import { ready } from "./utils";
import { take, union } from 'lodash';

(async () => {
	//添加创业指数，好在任务一启动时就先登录THS
	let codes: string[] = [];
	const ports = await ready(['UD2MR']);
	ports["UD2MR"]?.on('message', (cs) => {
		codes = union(cs, codes);
	});
	setInterval(() => {
		if (codes.length) {
			if (parentPort) {
				//TODO在开市期间测试出现系统抖动的原因，可能是方向频率问题
				parentPort.postMessage(take(codes, 15));
			}
		}
	}, 5000);
})();
