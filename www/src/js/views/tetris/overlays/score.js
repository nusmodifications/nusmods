// @flow

/**
 * Handles high scores for ModTris
 */

import { sortBy } from 'lodash';
import getLocalStorage from 'storage/localStorage';
import { MODTRIS_SCORES } from 'storage/keys';

export type ScoreEntry = {
  name: string,
  score: number,
  time: number,
};

export type ScoreData = ScoreEntry[];

export const HIGH_SCORE_COUNT = 5;
const localStorage = getLocalStorage();

export function getScoreData(): ScoreData {
  return JSON.parse(localStorage.getItem(MODTRIS_SCORES) || '[]');
}

export function addScoreData(newEntry: ScoreEntry) {
  // Add the new entry into the list and sort by score
  const entries = sortBy([...getScoreData(), newEntry], (entry) => entry.score).reverse();
  localStorage.setItem(MODTRIS_SCORES, JSON.stringify(entries.slice(0, HIGH_SCORE_COUNT)));
}
