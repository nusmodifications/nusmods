// @flow
import React from 'react';
import config from 'config';
import AnchorBlank from 'views/components/AnchorBlank';
import StaticPage from './StaticPage';
import styles from './FaqContainer.scss';

export default function FaqContainer() {
  return (
    <StaticPage title="FAQ">
      <h2>Frequently Asked Questions</h2>
      <hr />
      <div className={styles.question}>
        <p>
          Hi there! Before contacting us, please read the following FAQ (Frequently Asked Questions)
          first. In most cases, you <strong>DO NOT</strong> need to contact us. We are busy students
          just like you, so please try to save us some time as well!
        </p>
      </div>

      <div className={styles.question}>
        <h5>NUSMods is cool, where do you guys come from?</h5>
        <p>
          NUSMods is a student-run initiative and is not affiliated with the National University of
          Singapore. NUSMods was born out of the frustration of a lack of usable NUS timetable
          planners (<AnchorBlank href="https://webrb.nus.edu.sg/ctt/builder.aspx">
            the official one
          </AnchorBlank>{' '}
          provides a delightful hair-pulling experience &ndash; go ahead, try it out). Also, it
          seems like NUS does not intend to improve it anytime soon. Since most of us come from the
          School of Computing, we decided to put our technical skills to use, creating something
          that will make your lives easier and better.
        </p>
        <p>
          NUSMods does not make decisions regarding your curriculum, module availability and module
          timetable. If you have questions regarding your curriculum, CORS bidding, IVLE, or
          anything unrelated to NUSMods, it would be better to either contact your faculty and
          department or just <AnchorBlank href="https://www.google.com/">Google</AnchorBlank> it.
        </p>
      </div>

      <div className={styles.question}>
        <h5>There is a mistake! Can you update your system?</h5>
        <p>This question applies to these situations:</p>
        <ul>
          <li>There is a missing lecture or tutorial slot</li>
          <li>The exam date is wrong</li>
          <li>You cannot find a module</li>
          <li>Semester X data is not available</li>
          <li>
            You cannot add a module in semester X but your faculty says it is available in that
            semester
          </li>
        </ul>
        <p>
          We do not update module data manually. All module data shown in NUSMods is obtained from{' '}
          <AnchorBlank href="https://myaces.nus.edu.sg/cors/jsp/report/ModuleInfoListing.jsp">
            CORS
          </AnchorBlank>{' '}
          and{' '}
          <AnchorBlank href="https://ivle.nus.edu.sg/lms/public/search_course_public.aspx">
            IVLE
          </AnchorBlank>. Once the data becomes available there, NUSMods will reflect it within a
          day or two using the latest blockchain technology.
        </p>
        <p>
          Some faculties (FASS in particular) maintain their module timetable schedule on their
          faculty website, without updating the official school data sources such as CORS and IVLE.
          Unfortunately, we cannot obtain data from your faculty&apos;s site. Please tell your
          faculty to update CORS and IVLE.
        </p>
        <p>
          <strong>TL;DR</strong>: Please contact us only if you have done <em>all</em> these:
        </p>
        <ol>
          <li>You have ensured that the missing/incorrect data can be seen in CORS or IVLE.</li>
          <li>You have waited 1-2 days after checking CORS and IVLE in step 1.</li>
          <li>You have refreshed NUSMods after step 2.</li>
        </ol>
      </div>

      <div className={styles.question}>
        <h5>Is it possible to export my timetable to Excel?</h5>
        <p>
          No, and we have no plans to make this possible. Having said that, if you would like to
          implement this, we welcome pull requests{' '}
          <AnchorBlank href={config.contact.githubRepo}>here</AnchorBlank>!
        </p>
      </div>

      <div className={styles.question}>
        <h5>Why do I only see a white page when I open NUSMods?</h5>
        <p>
          Please update your browser. We recommend the latest version of Google Chrome, Firefox or
          Safari. If you are still seeing a white page in an up-to-date browser, do contact us.
        </p>
      </div>

      <hr />

      <p>
        Congratulations on making it to the end! If you still want to contact us, you may reach us
        via email at nusmods&#123;at&#125;googlegroups[dot]com or via{' '}
        <AnchorBlank href={config.contact.messenger}>Messenger</AnchorBlank>. Please allow up to 90
        working days for a reply.
      </p>
    </StaticPage>
  );
}
