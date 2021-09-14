import { job } from "./types";
import ms from "ms";
import Bree from "bree";
import { stringify } from 'querystring';

function typescript_worker() {
	const path = require('path');
	require('ts-node').register();
	const workerData = require('worker_threads').workerData;
	require(path.resolve(__dirname, workerData.__filename));
}

export function shedule(jobs: job[], handler: (message: any) => void): Bree {
	let buildJobs: any[] = [];
	jobs.forEach(job => {
		let w = {
			name: job.name,
			worker: { workerData: { __filename: job.path } },
			path: typescript_worker,
			closeWorkerAfterMs: job.cwams ? ms(job.cwams) : 0,
			interval: job.interval,
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
