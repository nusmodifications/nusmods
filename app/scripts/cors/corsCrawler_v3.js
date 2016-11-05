const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('graceful-fs');

// constants
const ROUND_NAMES = ['0', '1A', '1B', '1C', '2A', '2B', '3A', '3B'];

function formatDateTime(date, time, isClosedStart) {
  const dateTime = moment(`${date} ${time}`, 'DD/MM/YYYY HH:mm', true);
  if (!dateTime.isValid()) {
    throw new Error(`${date} ${time} is not a valid date`);
  }
  // closed bidding should start 1 sec after the stated time
  // this stops it from clashing with the end of the open bidding time
  if (isClosedStart) {
    dateTime.add(1, 'seconds');
  }
  return dateTime.format('MMMM D, YYYY, HH:mm:ss');
}

function formatNoClosed(infoArray) {
  const openStart = formatDateTime(infoArray[0], infoArray[1], false);
  let openEnd;
  const closedStart = null;
  const closedEnd = null;
  // open bidding starts and ends on different dates
  if (infoArray.length === 6) {
    openEnd = formatDateTime(infoArray[3], infoArray[4], false);
  } else {
    // open bidding starts and ends on the same date
    openEnd = formatDateTime(infoArray[0], infoArray[3], false);
  }

  return [openStart, openEnd, closedStart, closedEnd];
}

function formatRoundTwoOpen(infoArray) {
  // historically, all rounds with 2 open periods fit this format,
  // this may change in the future
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
  // open bidding starts and ends on different dates
  if (infoArray.length === 9) {
    openEnd = formatDateTime(infoArray[3], infoArray[4], false);
    closedStart = formatDateTime(infoArray[5], infoArray[6], true);
    closedEnd = formatDateTime(infoArray[5], infoArray[8], false);
  } else {
    // open bidding starts and ends on the same date
    openEnd = formatDateTime(infoArray[0], infoArray[3], false);
    closedStart = formatDateTime(infoArray[4], infoArray[5], true);
    closedEnd = formatDateTime(infoArray[4], infoArray[7], false);
  }
  return [openStart, openEnd, closedStart, closedEnd];
}

function createEntry(roundName, timeArray) {
  const entry = {
    round: roundName,
    openBiddingStart: timeArray[0],
    openBiddingEnd: timeArray[1],
    closedBiddingStart: timeArray[2],
    closedBiddingEnd: timeArray[3]
  };
  return entry;
}

function processText(textArray) {
  const roundName = textArray.shift();
  const roundInfo = textArray;
  const roundType = roundInfo.filter(text => text === 'to').length;
  let timingArray;
  switch (roundType) {
    case 1:
      // This means that the round has no closed bidding period
      timingArray = formatNoClosed(roundInfo);
      break;
    case 3:
      // This means that the round has 2 open bidding periods
      timingArray = formatRoundTwoOpen(roundInfo);
      break;
    default:
      // General case
      timingArray = formatGeneral(roundInfo);
      break;
  }
  const output = createEntry(roundName, timingArray);
  return output;
}

function getFileName(rawHeader) {
  const semInfo = rawHeader.replace(/\s+|Bidding Schedule|\(AY|20|\/|Semester|\)/g, '').split(',');
  return ['corsSchedule', semInfo[0], 'Sem', semInfo[1], '.json'].join('');
}

function writeToFile(roundArray, fileName) {
  const jsonArray = JSON.stringify(roundArray, null, 4);
  fs.writeFile(fileName, jsonArray, (error) => {
    if (error) {
      throw new Error(`write error: ${error.message}`);
    }
  });
}

const corsSite = 'http://www.nus.edu.sg/cors/schedule.html';
console.log('visiting ' + corsSite);
request(corsSite, (error, response, body) => {
  if (error) {
    throw new Error(`requesting site failed: ${error}`);
  }
  const $page = cheerio.load(body);
  const outputArray = [];
  // retrieve the academics year and semester for the file name
  const rawHeader = $page('span.middletabletext:has(span.scheduleheader1)').text().trim();
  const fileName = getFileName(rawHeader);
  // retrieve the bidding schedules
  $page('tbody:has(td.tableheader)>tr').each((index, element) => {
    const rawText = $page(element).text().trim();
    // clean up all the white space from the text
    const text = rawText.replace(/(\r\n\t\t\t\t|\r\n|\n|\r)/g, ' ')
                     .replace(/\s+/g, ' ');
    const textArray = text.split(' ');
    // check if this is a bidding round
    if (ROUND_NAMES.indexOf(textArray[0]) !== -1) {
      const newEntry = processText(textArray);
      outputArray.push(newEntry);
    }
  });
  writeToFile(outputArray, fileName);
});
