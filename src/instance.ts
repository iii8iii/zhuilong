import { Worker, MessageChannel } from "worker_threads";
import { thsBot } from "@iii8iii/thsbot";
import { Job, Port } from "./types";
import { msToEnd } from "./utils";
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

      //try to connet workers with messageChannel
      const { to, from } = j;
      if (to && to.length) {
        for (const t of to) {
          const wt = ws[t as keyof object] as Worker | undefined;
          if (wt) {
            const { port1, port2 } = new MessageChannel();

            let o: Port = {};
            o[`from`] = port1;
            wt.postMessage(o, [port1]);

            let n: Port = {};
            n[`to`] = port2;
            const wn = ws[name as keyof object] as Worker;
            wn.postMessage(n, [port2]);
          }
        }
      }

      if (from && from.length) {
        for (const f of from) {
          const wf = ws[f as keyof object] as Worker | undefined;
          if (wf) {
            const { port1, port2 } = new MessageChannel();

            let o: Port = {};
            o[`to`] = port1;
            wf.postMessage(o, [port1]);

            let n: Port = {};
            n[`from`] = port2;
            const wn = ws[name as keyof object] as Worker;
            wn.postMessage(n, [port2]);
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