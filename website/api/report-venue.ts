import axios from 'axios';
import type { VercelApiHandler } from '@vercel/node';
import { Octokit } from '@octokit/rest';

const codeBlock = (text, lang = '') => `\`\`\`${lang}\n${text}\n\`\`\``;

const unorderedList = (items) => items.map((item) => `- ${item}`).join('\n');

const toDataList = (data) => {
  const dataList = [`Room Name: ${data.roomName}`, `Floor: ${data.floor}`];

  if (data.location) {
    const { x, y } = data.location;
    dataList.push(
      `Location: [${y}, ${x}](https://www.openstreetmap.org/?mlat=${y}&mlon=${x}#map=19/${y}/${x})`,
    );
  }

  return unorderedList(dataList);
};

/**
 * @param {string} venue
 * @param {string} room
 * @param {array} latlng
 * @param {integer} floor
 * @param {string} comment
 * @param {string} reporterName
 * @param {string} reporterEmail
 * @param {boolean} debug
 */
const handler: VercelApiHandler = async (request) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const {
    venue,
    room,
    latlng = null,
    floor,
    comment = null,
    reporterName = null,
    reporterEmail = null,
    debug = false,
    context,
  } = request.body;

  console.log({
    venue,
    room,
    latlng,
    floor,
    comment,
    reporterName,
    reporterEmail,
  });

  // Get current version of the venue
  let currentVenue;
  let currentVenueError;

  try {
    const response = await axios.get('https://github.nusmods.com/venues');
    const currentVenues = response.data;
    currentVenue = currentVenues[venue];
  } catch (e) {
    currentVenueError = e;
  }

  const data = {
    roomName: room,
    floor,
  };

  if (latlng) {
    // TODO: Check latlng param validity
    const [y, x] = latlng;
    data.location = { x, y };
  }

  const paragraphs = [toDataList(data)];

  if (comment) {
    paragraphs.push('**Reporter comment:**');
    paragraphs.push(comment);
  }

  if (currentVenue) {
    const json = JSON.stringify(currentVenue, null, 2);
    paragraphs.push('**Current version:**');
    paragraphs.push(codeBlock(json, 'json'));
  } else if (currentVenueError) {
    paragraphs.push('**Error fetching current version**');
    paragraphs.push(codeBlock(currentVenueError.stack));
  } else {
    paragraphs.push('**Venue does not exist in current version**');
  }

  paragraphs.push('**Update proposed:**');
  paragraphs.push(codeBlock(`"${venue}": ${JSON.stringify(data, null, 2)}`, 'json'));

  if (reporterName || reporterEmail) {
    if (reporterName && reporterEmail) {
      paragraphs.unshift(`Reporter: ${reporterName} (${reporterEmail})`);
    } else {
      paragraphs.unshift(`Reporter: ${reporterName || reporterEmail}`);
    }
  }

  const body = paragraphs.join('\n\n');
  console.log(body);

  if (!process.env.MOCK_GITHUB && !debug) {
    await octokit.issues.create({
      owner: process.env.GITHUB_ORG,
      repo: process.env.GITHUB_REPO,
      title: `Venue data update for ${venue}`,
      body,
      labels: ['venue data'],
    });
  }
};

export default handler;
