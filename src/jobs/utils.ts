import { ztItem, stockItem } from '@iii8iii/dfcfbot/dist/types';
import { getZtStocksInfo } from '@iii8iii/dfcfbot';
import { differenceBy, difference } from "lodash";

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
 * 删除涨停股
 * @param {string[]} codes
 * @return {*} 
 */
export async function delZt(codes: string[]) {
  const zt: ztItem[] = await getZtStocksInfo();
  const ztCodes = getStockCode(zt);
  return difference(codes, ztCodes);
}
/**
 * 删除停牌股
 * @template T
 * @param {ztItem[]} zt 将停牌股作为参数传入，因为这个数据同一天内是固定的，一次请求多次使用，避免过多请求
 * @param {T[]} items
 * @return {*} 
 */
export function delTp<T>(tp: stockItem[], items: T[]) {
  return differenceBy(items, tp, 'c');
};

export async function reRun(fn: () => Promise<void>, msDelay = 15 * 1000) {
  await fn();
  setTimeout(() => {
    reRun(fn);
  }, msDelay);
}
