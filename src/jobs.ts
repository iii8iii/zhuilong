import Bree from "bree";

function typescript_worker() {
	const path = require('path');
	require('ts-node').register();
	const workerData = require('worker_threads').workerData;
	require(path.resolve(__dirname, workerData.__filename));
}

export function shedule(jobs: { name: string, interval: string, path: string; }[], handler: (message: any, workerMetadata: any) => void): Bree {
	let buildJobs: any[] = [];
	jobs.forEach(job => buildJobs.push({
		name: job.name,
		path: typescript_worker,
		interval: job.interval,
		worker: { workerData: { __filename: job.path } },
	}));
	return new Bree({
		root: false,
		jobs: buildJobs,
		workerMessageHandler: handler
	});
}
