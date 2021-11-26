import { Job } from "./types";
import Bree from "bree";

function typescript_worker() {
	const path = require('path');
	require('ts-node').register();
	const workerData = require('worker_threads').workerData;
	require(path.resolve(__dirname, workerData.__filename));
}

export function shedule(jobs: Job[], handler: (message: any, c: string) => void): Bree {
	let buildJobs: any[] = [];
	jobs.forEach(job => {
		let w = {
			name: job.name,
			worker: { workerData: { __filename: job.path } },
			timeout: `after ${job.start}`,
			path: typescript_worker,
			interval: `at ${job.start} every weekday`
		};
		buildJobs.push(w);
	});
	return new Bree({
		root: false,
		jobs: buildJobs,
		workerMessageHandler: (msg) => {
			handler(msg.message, '399006');
		}
	});
}
