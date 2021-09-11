import { ready } from "./utils";

(async () => {
	const mp = await ready(['port2AM']);
	mp.port2AM.on('message', (msg) => {
		console.log('message from AM', msg);
	});
})();
