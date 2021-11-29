import { parentPort } from "worker_threads";
import { difference, union } from "lodash";
import { delZt, reRun } from './utils';
import { msg, Result } from "../types";

(async () => {
	let zx: string[] = [];
	let records: Map<string, msg> = new Map();
	if (parentPort) {
		parentPort.on('message', msg => {
			const { from } = msg;
			from.on('message', async (result: Result) => {
				//获取信息
				let { name, zt, codes } = result;
				//根据结果要不要包含涨停对信息进行处理
				if (!zt) {
					codes = await delZt(codes);
				}
				//从记录获取上一次同一个任务发过来的编码信息，存到变量中
				let lastCodes = records.get(name)?.codes || [];
				//将新的编码信息存入记录，记录存入的时间
				records.set(name, { codes, time: Date.now() });
				//将新编码汇入自选并剔除过时的编码
				zx = difference(union(codes, zx), difference(lastCodes, codes));
			});
		});
	}

	reRun(async () => {
		//每次向同花顺更新代码时，先获取当前时间
		const now = Date.now();
		//遍历已经存在的记录，如果发现有记录的更新时间距现在超过30秒
		//将从目前确定的自选数据中剔除包含在这条记录中的所有编码
		//并将此记录从记录表中删除
		records.forEach((v, k) => {
			if (now - v.time > 1000 * 30) {
				zx = difference(zx, v.codes);
				records.delete(k);
				console.log('CLEAN CODES FROM JOB: ', k);
			}
		});
		if (parentPort) {
			parentPort.postMessage(zx);
			zx = [];
		}
	});
})();
