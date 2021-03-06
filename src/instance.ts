import { Worker, MessageChannel } from "worker_threads";
import { thsBot } from "@iii8iii/thsbot";
import { Job, Port } from "./types";
import { inArray, msToEnd } from "./utils";
import { shedule } from "./jobs";
import Bree from 'bree';

export class Instance {
  private shedule: Bree;
  private ths: thsBot;
  private jobs: Job[];
  constructor(ths: thsBot, jobs: Job[]) {
    this.ths = ths;
    this.jobs = jobs;
    this.shedule = shedule(jobs, this.ths.update.bind(this.ths));
    this.shedule.on('worker created', (name) => {
      const ws = this.shedule.workers;
      const j = this.jobs.find(v => v.name === name) as Job;
      //try to connet workers depon this worker with messageChannel
      const { link } = j;
      if (link && link.length) {
        for (const l of link) {
          const wl = ws[l as keyof object] as Worker | undefined;
          if (wl) {
            const { port1, port2 } = new MessageChannel();

            let o: Port = {};
            o[`to`] = port1;
            wl.postMessage(o, [port1]);

            let n: Port = {};
            n[`from`] = port2;
            const wn = ws[name as keyof object] as Worker;
            wn.postMessage(n, [port2]);
          }
        }
      }

      //try to find workers which this worker deponed on and connet them with messageChannel
      const js = this.jobs.filter(j => j.name != name) as Job[];
      for (const j of js) {
        const { link } = j;
        if (link && link.length) {
          if (inArray(name, link)) {
            const wj = ws[j.name as keyof object] as Worker | undefined;
            if (wj) {
              const { port1, port2 } = new MessageChannel();

              let q: Port = {};
              q['from'] = port2;
              wj.postMessage(q, [port2]);

              let p: Port = {};
              p['to'] = port1;
              const wn = ws[name as keyof object] as Worker;
              wn.postMessage(p, [port1]);
            }
          }
        }
      }

      //try to stop the worker at the endTime
      const { end } = j;
      const w = ws[name as keyof object] as Worker;
      w.on('online', () => {
        (this.shedule.closeWorkerAfterMs[name as keyof object] as any) = setTimeout(() => {
          w.terminate();
        }, msToEnd(end));
      });
    });
  }

  start() {
    try {
      this.shedule.start();
    } catch (error) {
      console.log(error);
    }
  }
  async stop() {
    await this.shedule.stop();
  }
  async updateJobs(jobs: Job[]) {
    await this.shedule.stop();
    this.shedule = shedule(jobs, this.ths.update.bind(this.ths));
    this.start();
  }
}