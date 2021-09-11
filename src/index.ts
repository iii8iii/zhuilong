import { Browser, BrowserContext, firefox } from 'playwright-firefox';
import { thsBot } from '@iii8iii/thsbot';
import { WechatBot } from "@iii8iii/wechatbot";
import { Instance } from "./instance";
import { unionBy } from "lodash";
import { job } from "./types";

import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, '.env') });

export class Zhuilong {
  private bot: WechatBot | undefined;
  private brower: Browser | undefined;
  private instances: Map<string, Instance> = new Map();
  private jobs: job[];
  constructor(jobs?: job[]) {
    const botUrls = process.env.botUrls?.split(',') || [];
    if (botUrls.length) {
      this.bot = new WechatBot(botUrls);
    }
    this.jobs = jobs || [];
  }

  private async initBrowser(): Promise<Browser> {
    try {
      const hdl = process.env.NODE_ENV === "production";
      this.brower = this.brower ? this.brower : await firefox.launch({ headless: hdl });
      this.brower.on('disconnected', () => {
        console.log('BROWSER OUT');
      });
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
        const ths: thsBot = new thsBot(ctx, id, password, this.bot);
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
}

(async () => {
  const zl = new Zhuilong([
    { name: 'AM', path: 'src/jobs/index.ts', interval: 'every 10 seconds after 7:00 before 18:30' },
    { name: 'PM', path: 'src/jobs/index2.ts', interval: 'every 10 seconds after 12:50 before 18:00', linkTo: ['AM'] },
  ]);
  await zl.new(process.env.USER as string, process.env.USERPSW as string);
  zl.startAll();
})();

