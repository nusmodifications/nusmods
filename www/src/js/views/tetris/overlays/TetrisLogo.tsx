// @flow

import React from 'react';
import { chunk } from 'lodash';
import withTimer from 'views/hocs/withTimer';
import styles from './TetrisLogo.scss';

type Props = {| +currentTime: Date |};

const FPS = 5;
const interval = 1000 / FPS;

const SEGMENT_WIDTH = 4;

// prettier-ignore
const logoText =
`___  ______________ ___________ _____ _____
|  \\/  |  _  |  _  \\_   _| ___ \\_   _/  ___|
| .  . | | | | | | | | | | |_/ / | | \\ \`--.
| |\\/| | | | | | | | | | |    /  | |  \`--. \\
| |  | \\ \\_/ / |/ /  | | | |\\ \\ _| |_/\\__/ /
\\_|  |_/\\___/|___/   \\_/ \\_| \\_|\\___/\\____/ `;

// Split the ASCII art into segments of 4 characters
const lines = logoText.split('\n');
const segments = lines.map((line) =>
  chunk(line.split(''), SEGMENT_WIDTH).map((segment) => segment.join('')),
);

// Colors from Material colors
const colors = [
  'rgb(198, 40, 40)',
  'rgb(173, 20, 87)',
  'rgb(106, 27, 154)',
  'rgb(69, 39, 160)',
  'rgb(40, 53, 147)',
  'rgb(21, 101, 192)',
  'rgb(2, 119, 189)',
  'rgb(0, 131, 143)',
  'rgb(0, 105, 92)',
  'rgb(46, 125, 50)',
  'rgb(85, 139, 47)',
  'rgb(158, 157, 36)',
  'rgb(249, 168, 37)',
  'rgb(255, 143, 0)',
  'rgb(239, 108, 0)',
  'rgb(216, 67, 21)',
];

function TetrisLogo(props: Props) {
  // Create the diagonal bands by offsetting the color using line and char index
  // Make the bands move by offsetting the color using time

  const timeOffset = Math.round(props.currentTime.getTime() / interval);

  const wrappedLines = segments.map((line, lineIndex) =>
    line.map((segment, charIndex) => (
      <span
        key={charIndex}
        style={{
          color: colors[(lineIndex + charIndex + timeOffset) % colors.length],
        }}
      >
        {segment}
      </span>
    )),
  );

  return (
    <div className={styles.wrapper}>
      <pre className={styles.logo}>
        {wrappedLines.map((line, i) => (
          <React.Fragment key={`br-${i}`}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </pre>
    </div>
  );
}

export default withTimer(TetrisLogo, interval);
