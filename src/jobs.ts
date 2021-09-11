import { job } from "./types";
import Bree from "bree";

function typescript_worker() {
	const path = require('path');
	require('ts-node').register();
	const workerData = require('worker_threads').workerData;
	require(path.resolve(__dirname, workerData.__filename));
}

export function shedule(jobs: job[], handler: (message: any) => void): Bree {
	let buildJobs: any[] = [];
	jobs.forEach(job => {
		buildJobs.push({
			name: job.name,
			interval: `${job.interval} every weekday`,
			timeout: 0,
			path: typescript_worker,
			worker: { workerData: { __filename: job.path } },
		});
	});
	return new Bree({
		root: false,
		jobs: buildJobs,
		workerMessageHandler: handler
	});
}
