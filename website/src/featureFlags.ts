/* eslint-disable import/prefer-default-export */

/** Enable Course Planning Exercise */
const isProduction = process.env.VERCEL_ENV === 'production';
export const enableCPEx = !isProduction;

export const showCPExTab = !isProduction;
