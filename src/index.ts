import { Browser, BrowserContext, firefox } from 'playwright-firefox';
import { thsBot } from '@iii8iii/thsbot';
import { WechatBot } from "@iii8iii/wechatbot";
import { Instance } from "./instance";
import { unionBy } from "lodash";
import { Job } from "./types";

import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, '.env') });

export class Zhuilong {
  private bot: WechatBot | undefined;
  private brower: Browser | undefined;
  private instances: Map<string, Instance> = new Map();
  private jobs: Job[];
  constructor(jobs?: Job[]) {
    const botUrls = process.env['botUrls']?.split(',') || [];
    if (botUrls.length) {
      this.bot = new WechatBot(botUrls);
    }
    this.jobs = jobs || [];
  }

  private async initBrowser(): Promise<Browser> {
    try {
      const hdl = process.env['NODE_ENV'] === "production";
      this.brower = this.brower ? this.brower : await firefox.launch({ headless: hdl });
      return this.brower;
    } catch (error) {
      console.log('====================================');
      console.log('ERROR OCURRED IN INITBROWSER');
      console.log('====================================');
      return await this.initBrowser();
    }
  }

  async new(id: string, password: string, jobs: Job[] = []): Promise<Instance> {
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

  updateJobs(id: string, jobs: Job[]) {
    this.instances.get(id)?.updateJobs(jobs);
  }
}


//make a test
(async () => {
  const zl = new Zhuilong([
    { name: 'GD', path: 'src/jobs/JgetData.ts', start: 'after 9:25 ', linkTo: ['MR'] },
    { name: 'MR', path: 'src/jobs/JmorningRace.ts', start: 'after 9:25 ', linkTo: ['GD', 'UD'] },
    { name: 'UD', path: 'src/jobs/update.ts', start: 'after 9:25 ', linkTo: ['MR'] },
  ]);
  await zl.new(process.env['USER'] as string, process.env['USERPSW'] as string);
  zl.startAll();
})();

