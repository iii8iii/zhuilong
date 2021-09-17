import { Job, Time } from "./types";
import dayjs from 'dayjs';
import Bree from "bree";

function typescript_worker() {
	const path = require('path');
	require('ts-node').register();
	const workerData = require('worker_threads').workerData;
	require(path.resolve(__dirname, workerData.__filename));
}

function msToEnd(endTime: Time = { h: 15, m: 0, s: 0, ms: 0 }) {
	const { h, m, s, ms } = endTime;
	const now = dayjs().valueOf();
	const end = dayjs().hour(h).minute(m).second(s).millisecond(ms).valueOf();
	return end > now ? end - now : 0;
}

export function shedule(jobs: Job[], handler: (message: any) => void): Bree {
	let buildJobs: any[] = [];
	jobs.forEach(job => {
		let w = {
			name: job.name,
			timeout: job.start,
			worker: { workerData: { __filename: job.path } },
			path: typescript_worker,
			closeWorkerAfterMs: msToEnd(job.end),
			interval: 'every weekday'
		};
		buildJobs.push(w);
	});
	return new Bree({
		root: false,
		jobs: buildJobs,
		workerMessageHandler: (msg) => {
			handler(msg.message);
		}
	});
}
