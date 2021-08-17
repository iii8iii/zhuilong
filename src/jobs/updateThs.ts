import { parentPort } from "worker_threads";

if (parentPort) {
	parentPort.postMessage(['300345', '300688']);
} else {
	process.exit(0);
}