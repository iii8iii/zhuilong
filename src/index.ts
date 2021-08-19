import { Browser, BrowserContext, firefox } from 'playwright-firefox';
import { thsBot } from '@iii8iii/thsbot';
import { Instance } from "./instance";
import { unionBy } from "lodash";
import { job } from "./types";

import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, '.env') });

export class Zhuilong {
  private botUrls: string[];
  private brower: Browser | undefined;
  private instances: Map<string, Instance> = new Map();
  private jobs: job[];
  constructor(jobs?: job[]) {
    this.botUrls = process.env.botUrls?.split(',') || [];
    this.jobs = jobs || [];
  }

  private async initBrowser(): Promise<Browser> {
    try {
      const hdl = process.env.NODE_ENV === "production";
      this.brower = this.brower ? this.brower : await firefox.launch({ headless: hdl });
      return this.brower;
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN INITBROWSER');
      console.log('====================================');
      return await this.initBrowser();
    }
  }

  async new(id: string, password: string, jobs: job[] = []): Promise<Instance> {
    try {
      if (!this.instances.has(id)) {
        const browser: Browser = await this.initBrowser();
        const ctx: BrowserContext = await browser.newContext();
        const ths: thsBot = new thsBot(ctx, id, password, this.botUrls);
        jobs = unionBy(this.jobs, jobs, 'name');
        const instance: Instance = new Instance(ths, jobs);
        this.instances.set(id, instance);
      }
      return this.instances.get(id) as Instance;
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN NEWINSTANCE');
      console.log('====================================');
      return await this.new(id, password, jobs);
    }
  }

  start(id: string) {
    try {
      this.instances.get(id)?.start();
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN STARTINSTANCE');
      console.log('====================================');
    }
  }

  stop(id: string) {
    try {
      this.instances.get(id)?.stop();
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN STOPINSTANCE');
      console.log('====================================');
    }
  }

  startAll() {
    try {
      this.instances.forEach(instance => {
        instance.start();
      });
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN STARTINSTANCES');
      console.log('====================================');
    }
  }

  updateJobs(id: string, jobs: job[]) {
    this.instances.get(id)?.updateJobs(jobs);
  }

  async reload(id: string) {
    try {
      await this.instances.get(id)?.reload();
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN RELOAD');
      console.log('====================================');
    }
  }
}

(async () => {
  const zl = new Zhuilong([
    { name: 'morning', path: 'src/jobs/updateThs.ts', interval: 'every 10 seconds' },
    { name: 'afternoon', path: 'src/jobs/updateThs.ts', interval: 'every 10 seconds' }
  ]);
  await zl.new(process.env.USER as string, process.env.USERPSW as string);
  zl.startAll();
})();

