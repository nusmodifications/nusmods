'use strict';
const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('graceful-fs');

const CORS_URL = 'http://www.nus.edu.sg/cors/schedule.html';
const ROUND_NAMES = ['0', '1A', '1B', '1C', '2A', '2B', '3A', '3B'];

function formatDateTime(date, time, isStartOfClosedBidding) {
  const dateTime = moment(`${date} ${time}`, 'DD/MM/YYYY HH:mm', true);
  if (!dateTime.isValid()) {
    throw new Error(`${date} ${time} is not a valid date`);
  }
  // Closed bidding round should start 1 sec after the stated time.
  // This stops it from clashing with the end of the open bidding period.
  if (isStartOfClosedBidding) {
    dateTime.add(1, 'seconds');
  }

  return dateTime.format('MMMM D, YYYY, HH:mm:ss');
}

function formatRoundWithoutClosedBidding(infoArray) {
  const openStart = formatDateTime(infoArray[0], infoArray[1], false);
  let openEnd;
  const closedStart = null;
  const closedEnd = null;
  // Open bidding period starts and ends on different dates.
  if (infoArray.length === 6) {
    openEnd = formatDateTime(infoArray[3], infoArray[4], false);
  } else {
    // Open bidding period starts and ends on the same date.
    openEnd = formatDateTime(infoArray[0], infoArray[3], false);
  }

  return [openStart, openEnd, closedStart, closedEnd];
}

function formatRoundTwoOpenBidding(infoArray) {
  // Historically, all rounds with 2 open bidding periods fit this format,
  // but this may change in the future.
  const openStart = formatDateTime(infoArray[0], infoArray[1], false);
  const openEnd = formatDateTime(infoArray[8], infoArray[9], false);
  const closedStart = formatDateTime(infoArray[10], infoArray[11], true);
  const closedEnd = formatDateTime(infoArray[10], infoArray[13], false);
  return [openStart, openEnd, closedStart, closedEnd];
}

function formatGeneral(infoArray) {
  const openStart = formatDateTime(infoArray[0], infoArray[1], false);
  let openEnd;
  let closedStart;
  let closedEnd;
  // Open bidding period starts and ends on different dates
  if (infoArray.length === 9) {
    openEnd = formatDateTime(infoArray[3], infoArray[4], false);
    closedStart = formatDateTime(infoArray[5], infoArray[6], true);
    closedEnd = formatDateTime(infoArray[5], infoArray[8], false);
  } else {
    // Open bidding period starts and ends on the same date
    openEnd = formatDateTime(infoArray[0], infoArray[3], false);
    closedStart = formatDateTime(infoArray[4], infoArray[5], true);
    closedEnd = formatDateTime(infoArray[4], infoArray[7], false);
  }
  return [openStart, openEnd, closedStart, closedEnd];
}

function processRoundRow(textArray) {
  const roundName = textArray.shift();
  const roundInfo = textArray;
  const roundType = roundInfo.filter(text => text === 'to').length;
  let timingArray;
  switch (roundType) {
    case 1:
      // This means that the round has no closed bidding period.
      timingArray = formatRoundWithoutClosedBidding(roundInfo);
      break;
    case 3:
      // This means that the round has 2 open bidding periods.
      timingArray = formatRoundTwoOpenBidding(roundInfo);
      break;
    default:
      // General case.
      timingArray = formatGeneral(roundInfo);
      break;
  }

  return {
    round: roundName,
    openBiddingStart: timingArray[0],
    openBiddingEnd: timingArray[1],
    closedBiddingStart: timingArray[2],
    closedBiddingEnd: timingArray[3]
  };
}

console.log(`Fetching page ${CORS_URL}...`);
request(CORS_URL, (error, response, body) => {
  if (error) {
    throw new Error(`requesting site failed: ${error}`);
  }
  const $page = cheerio.load(body);
  const roundsData = [];
  // Retrieve the academic year and semester for the file name.
  const rawHeader = $page('span.middletabletext:has(span.scheduleheader1)').text().trim();
  const semInfo = rawHeader.replace(/\s+|Bidding Schedule|\(AY|20|\/|Semester|\)/g, '').split(',');
  const fileName = `corsSchedule${semInfo[0]}Sem${semInfo[1]}.json`;

  // Extract the bidding schedules.
  $page('tbody:has(td.tableheader) > tr').each((index, element) => {
    const rawText = $page(element).text().trim();
    // Clean up all the white space from the text.
    const text = rawText.replace(/(\r\n\t\t\t\t|\r\n|\n|\r)/g, ' ')
                  .replace(/\s+/g, ' ');
    const textArray = text.split(' ');
    // Check if this is a bidding round.
    if (ROUND_NAMES.indexOf(textArray[0]) !== -1) {
      const newEntry = processRoundRow(textArray);
      roundsData.push(newEntry);
    }
  });

  // Write to file.
  const jsonArray = JSON.stringify(roundsData, null, 4) + '\n';
  console.log(jsonArray);
  fs.writeFile(fileName, jsonArray, (error) => {
    if (error) {
      throw new Error(`Write error: ${error.message}`);
    }
  });

  console.log(`Successfully written to ${fileName}.`);
});
