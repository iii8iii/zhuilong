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
      const { linkTo } = j;
      if (linkTo && linkTo.length) {
        for (const l of linkTo) {
          const wl = ws[l as keyof object] as Worker | undefined;
          if (wl) {
            const { port1, port2 } = new MessageChannel();

            let o: Port = {};
            o[`${l}2${name}`] = port1;
            wl.postMessage(o, [port1]);

            let n: Port = {};
            n[`${name}2${l}`] = port2;
            const wn = ws[name as keyof object] as Worker;
            wn.postMessage(n, [port2]);
          }
        }
      }

      //try to stop the worker at the endTime
      //TODO need to test
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