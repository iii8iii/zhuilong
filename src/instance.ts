import { thsBot } from "@iii8iii/thsbot";
import { Worker, MessageChannel } from "worker_threads";
import { shedule } from "./jobs";
import { job, port } from "./types";
import Bree from 'bree';

export class Instance {
  private shedule: Bree;
  private ths: thsBot;
  private jobs: job[];
  constructor(ths: thsBot, jobs: job[]) {
    this.ths = ths;
    this.jobs = jobs;
    this.shedule = shedule(jobs, this.ths.update.bind(this.ths));
    this.shedule.on('worker created', (name) => {
      const ws = this.shedule.workers;
      const j = this.jobs.find(v => v.name === name) as job;
      const { linkTo } = j;
      if (linkTo && linkTo.length) {
        for (const l of linkTo) {
          const wl = ws[l as keyof object] as Worker | undefined;
          if (wl) {
            const { port1, port2 } = new MessageChannel();

            let o: port = {};
            o[`port2${name}`] = port1;
            wl.postMessage(o, [port1]);

            let n: port = {};
            n[`port2${l}`] = port2;
            const wn = ws[name as keyof object] as Worker;
            wn.postMessage(n, [port2]);
          }
        }
      }
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
  async updateJobs(jobs: job[]) {
    await this.shedule.stop();
    this.shedule = shedule(jobs, this.ths.update.bind(this.ths));
    this.start();
  }
}