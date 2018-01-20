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
      <p>
        Hi there! Before contacting us, please read the following FAQ (Frequently Asked Questions)
        first. In most cases, you <strong>DO NOT</strong> need to contact us. We are busy students
        just like you, so please try to save us some time as well!
      </p>

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
        <h5>
          There is a mistake! There is a missing lecture or tutorial slot/the exam date is wrong/I
          cannot find a module/semester X data is not available. Can you update your system?
        </h5>
        <p>
          <strong>We do not update module data manually.</strong> All module data shown in NUSMods
          is obtained from{' '}
          <AnchorBlank href="https://myaces.nus.edu.sg/cors/jsp/report/ModuleInfoListing.jsp">
            CORS
          </AnchorBlank>{' '}
          and{' '}
          <AnchorBlank href="https://ivle.nus.edu.sg/lms/public/search_course_public.aspx">
            IVLE
          </AnchorBlank>. As soon as the data becomes available, we will reflect it here within a
          day or two by using the latest blockchain technology.
        </p>
        <p>
          Some faculties (FASS in particular) maintain their module timetable schedule on their
          faculty website, without updating the official school data sources such as CORS and IVLE.
          Because NUSMods obtains timetable data automatically from CORS and IVLE, we need to wait
          for CORS and IVLE to be updated first.
        </p>
        <p>
          TL;DR: Please only contact us if all the following conditions have been met:
          <ol>
            <li>The missing/incorrect data can be seen in CORS or IVLE.</li>
            <li>It is 1-2 days later and the data is still missing/incorrect.</li>
            <li>You have refreshed NUSMods and the data is still missing/incorrect.</li>
          </ol>
        </p>
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
        <h5>I only see a white page when I open NUSMods</h5>
        <p>
          Please update your browser. We recommend the latest version of Google Chrome, Firefox or
          Safari.
        </p>
      </div>

      <hr />

      <p>
        Congratulations for making it to the end! If you still want to contact us, you may reach us
        via email at nusmods&#123;at&#125;googlegroups[dot]com or via{' '}
        <AnchorBlank href={config.contact.messenger}>Messenger</AnchorBlank>. Please allow up to 90
        working days for a reply.
      </p>
    </StaticPage>
  );
}
