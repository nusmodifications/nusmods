// @flow
import React from 'react';
import config from 'config';
import ExternalLink from 'views/components/ExternalLink';
import StaticPage from './StaticPage';
import styles from './FaqContainer.scss';

export default function FaqContainer() {
  return (
    <StaticPage title="FAQ">
      <h2>Frequently Asked Questions</h2>
      <hr />
      <div>
        <p>
          Hi there! Before contacting us, please read the following FAQ. In most cases, you{' '}
          <strong>DO NOT</strong> need to contact us. We are busy students just like you, so please
          try to save us some time as well!
        </p>
      </div>

      <ul>
        <li>
          <a href="#mistakes">Can you update your system?</a>
        </li>
        <li>
          <a href="#mistakes">Can you add a missing lecture/tutorial slot?</a>
        </li>
        <li>
          <a href="#mistakes">Can you update the exam date?</a>
        </li>
        <li>
          <a href="#mistakes">Can you add this module?</a>
        </li>
        <li>
          <a href="#mistakes">When will semester X data be available?</a>
        </li>
        <li>
          <a href="#mistakes">
            Why can&apos;t I add this module in semester X? My faculty says that it is available in
            semester X.
          </a>
        </li>
        <li>
          <a href="#mac-calendar">
            When I import the calendar into macOS Calendar app, the lessons show up on recess week /
            on public holidays / on weeks the lessons are not on
          </a>
        </li>
        <li>
          <a href="#about">NUSMods is cool, where do you guys come from?</a>
        </li>
        <li>
          <a href="#export">Is it possible to export my timetable to Excel?</a>
        </li>
        <li>
          <a href="#white-page">Why do I only see a white page when I open NUSMods?</a>
        </li>
      </ul>

      <hr />

      <div className={styles.question} id="mistakes">
        <h5>There is a mistake! Can you update your system?</h5>
        <p>This question applies to these situations:</p>
        <ul>
          <li>There is a missing lecture or tutorial slot.</li>
          <li>The exam date is wrong.</li>
          <li>You cannot find a module.</li>
          <li>Semester X data is not available.</li>
          <li>
            You cannot add a module in semester X but your faculty says it is available in that
            semester.
          </li>
        </ul>
        <p>
          We do not update module data manually. All module data shown in NUSMods is obtained from{' '}
          <ExternalLink href="https://myaces.nus.edu.sg/cors/jsp/report/ModuleInfoListing.jsp">
            CORS
          </ExternalLink>{' '}
          and{' '}
          <ExternalLink href="https://ivle.nus.edu.sg/lms/public/search_course_public.aspx">
            IVLE
          </ExternalLink>
          . Protip: every NUSMods module page also has a direct link to CORS and IVLE. Once the data
          becomes available there, NUSMods will reflect it within a day or two using the latest
          blockchain technology.
        </p>
        <p>
          Some faculties (FASS in particular) maintain their module timetable schedule on their
          faculty website, without updating the official school data sources such as CORS and IVLE.
          Unfortunately, we cannot obtain data from your faculty&apos;s site. Please tell your
          faculty to update CORS and IVLE.
        </p>
        <p>
          <strong>TL;DR</strong>: Please contact us only <em>after</em> you have done all these:
        </p>
        <ol>
          <li>You have ensured that the missing/incorrect data can be seen in CORS or IVLE.</li>
          <li>You have waited 1-2 days after checking CORS and IVLE in step 1.</li>
          <li>You have refreshed NUSMods after step 2.</li>
        </ol>
      </div>

      <div className={styles.question} id="mac-calendar">
        <h5>
          When I import the calendar into macOS Calendar app, the lessons show up during recess week
          / on public holidays / on weeks the lessons are not on
        </h5>
        <p>
          Unfortunately, the macOS Calendar app has a bug which we cannot work around. Our ICS file
          is correct, but Calendar refuses to import it correctly. You can try using another
          calendar app like{' '}
          <ExternalLink href="https://calendar.google.com/">Google Calendar</ExternalLink> or{' '}
          <ExternalLink href="https://outlook.com">Outlook.com</ExternalLink>. If you want an app,
          here&apos;s{' '}
          <ExternalLink href="https://zapier.com/blog/best-calendar-apps/">
            a list of 18 apps for macOS
          </ExternalLink>
          .
        </p>

        <p>
          You can also link your NUSNet email account with the macOS Mail app, which gives you the
          option to sync your school timetable automatically.
        </p>

        <p>
          We have also found that the bug only occurs some of the time, so if you really want to,
          you can try removing and adding back the calendar until it works (no, we don&apos;t know
          why this works either).
        </p>
      </div>

      <div className={styles.question} id="about">
        <h5>NUSMods is cool, where do you guys come from?</h5>
        <p>
          NUSMods is a student-run initiative and is not affiliated with the National University of
          Singapore. NUSMods was born out of the frustration of a lack of usable NUS timetable
          planners (
          <ExternalLink href="https://webrb.nus.edu.sg/ctt/builder.aspx">
            the official one
          </ExternalLink>{' '}
          provides a delightful hair-pulling experience &ndash; go ahead, try it out). Also, it
          seems like NUS does not intend to improve it anytime soon. Since most of us come from the
          School of Computing, we decided to put our technical skills to use, creating something
          that will make your lives easier and better.
        </p>
        <p>
          NUSMods does not make decisions regarding your curriculum, module availability and module
          timetable. If you have questions regarding your curriculum, CORS bidding, IVLE, or
          anything unrelated to NUSMods, it would be better to either contact your faculty and
          department or just <ExternalLink href="https://www.google.com/">Google</ExternalLink> it.
        </p>
      </div>

      <div className={styles.question} id="export">
        <h5>Is it possible to export my timetable to Excel?</h5>
        <p>
          No, and we have no plans to make this possible. Having said that, if you would like to
          implement this, we welcome pull requests{' '}
          <ExternalLink href={config.contact.githubRepo}>here</ExternalLink>!
        </p>
      </div>

      <div className={styles.question} id="white-page">
        <h5>Why do I only see a white page when I open NUSMods?</h5>
        <p>
          Please update your browser. Although we recommend the latest version of Google Chrome,
          Firefox, Safari or Edge, we support the latest two versions of these browsers.
          Unfortunately, we cannot support more browsers or older versions due to our limited
          resources. If you are using iOS 9 or below, please update your device to iOS 10 or 11, or
          use another computer to access NUSMods.
        </p>
        <p>
          If you are seeing a white page in an up-to-date Chrome, Firefox, Safari or Edge, do
          contact us.
        </p>
      </div>

      <div className={styles.conclusion}>
        <hr />
        <p>
          Congratulations on making it to the end! If you still want to contact us, you may reach us
          via email at nusmods&#123;at&#125;googlegroups[dot]com or via{' '}
          <ExternalLink href={config.contact.messenger}>Messenger</ExternalLink>. Please allow up to
          90 working days for a reply.
        </p>
      </div>
    </StaticPage>
  );
}
