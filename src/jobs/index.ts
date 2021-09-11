import { setInterval } from 'timers';
import { ready } from "./utils";

(async () => {
	const mp = await ready(['port2PM']);
	setInterval(() => {
		mp.port2PM.postMessage({ t: Date.now() });
	}, 5000);
})();
