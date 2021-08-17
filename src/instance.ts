import { thsBot } from "@iii8iii/thsbot";
import { shedule } from "./jobs";
import { job } from "./types";
import Bree from 'bree';
export class Instance {
  private shedule: Bree;
  private ths: thsBot;
  constructor(ths: thsBot, jobs: job[]) {
    this.ths = ths;
    this.shedule = shedule(jobs, this.handler.bind(this));
  }
  async handler(msg: { name: string, message: string[]; }) {
    await this.ths.update(msg.message);
  }
  start() {
    this.shedule.start();
  }
  stop() {
    this.shedule.stop();
  }
  updateJobs(jobs: job[]) {
    this.shedule = shedule(jobs, this.handler.bind(this));
  }
  async reload() {
    await this.shedule.stop();
    this.shedule.start();
  }
}