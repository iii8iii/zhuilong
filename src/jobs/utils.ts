import { ztItem, stockItem } from '@iii8iii/dfcfbot/dist/types';
import { difference, differenceBy } from "lodash";
import { parentPort } from "worker_threads";
import { Port } from "../types";


/**
 * 获取股票代码，传入还C属性的股票信息
 * @param {{ c: string; }[]} data
 * @return {*} 
 */
export function getStockCode(data: stockItem[]) {
  const stockCodes: string[] = [];
  data.forEach(item => stockCodes.push(item.c));
  return stockCodes;
};


/**
 * 传入一个接口数组，等待这些接口打通之后才进行接下来的步骤
 * 接口名的规则是jobnameA2jobnameB
 * @param {string[]} ports
 * @return {*} 
 */
export async function ready(ports: string[]) {
  let messagePorts: Port = {};
  const p: Promise<void> = new Promise(resolve => {
    if (parentPort) {
      parentPort.on('message', msg => {
        ports = difference(ports, Object.keys(msg));
        messagePorts = Object.assign(messagePorts, msg);
        if (ports.length == 0) resolve();
      });
    }
  });
  await p;
  return messagePorts;
};

/**
 * 在股票信息级别直接去除已经涨停的股票信息
 * 这样做是为了减少不必要的运算，
 * 因为股票涨停时是没有办法买的
 * @template T
 * @param {ztItem[]} zt
 * @param {T[]} items
 * @return {*} 
 */
export function delzt<T>(zt: ztItem[], items: T[]) {
  return differenceBy(items, zt, 'c');
};


export async function reRun(fn: () => Promise<void>, msDelay = 1000) {
  await fn();
  setTimeout(() => {
    reRun(fn);
  }, msDelay);
}