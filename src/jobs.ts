import { Job } from "./types";
import Bree from "bree";

function typescript_worker() {
	const path = require('path');
	require('ts-node').register();
	const workerData = require('worker_threads').workerData;
	require(path.resolve(__dirname, workerData.__filename));
}

export function shedule(jobs: Job[], handler: (message: any) => void): Bree {
	let buildJobs: any[] = [];
	jobs.forEach(job => {
		let w = {
			name: job.name,
			timeout: job.start,
			worker: { workerData: { __filename: job.path } },
			path: typescript_worker,
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
