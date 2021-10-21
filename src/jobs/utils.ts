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

export async function delZt(codes: string[]) {
  const zt: ztItem[] = await getZtStocksInfo();
  const ztCodes = getStockCode(zt);
  return difference(codes, ztCodes);
}
/**
 * 在股票信息级别直接去除已经涨停的股票信息
 * 这样做是为了减少不必要的运算，
 * 因为股票涨停时是没有办法买的
 * @template T
 * @param {ztItem[]} zt
 * @param {T[]} items
 * @return {*} 
 */
export function clearStocks<T>(zt: ztItem[], tp: stockItem[], items: T[]) {
  return differenceBy(items, zt, tp, 'c');
};


export async function reRun(fn: () => Promise<void>, msDelay = 1000) {
  await fn();
  setTimeout(() => {
    reRun(fn);
  }, msDelay);
}