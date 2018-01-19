// @flow

import React from 'react';

import config from 'config';
import StaticPage from './StaticPage';
import styles from './FaqContainer.scss';

export default function FaqContainer() {
  return (
    <StaticPage title="FAQ">
      <h2>Frequently Asked Questions</h2>
      <hr />
      <p>
        Hi there! Before contacting us, please read the following FAQ (Frequently Asked Questions)
        first. In most cases, you <strong>DO NOT</strong> need to contact us.
      </p>

      <div className={styles.question}>
        <h5>NUSMods is cool, where do you guys come from?</h5>
        <p>
          NUSMods is a student-run initiative and is not affiliated with the National University of
          Singapore. NUSMods was born out of the frustration of a lack of usable NUS timetable
          planners (<a href="https://webrb.nus.edu.sg/ctt/builder.aspx">the official one</a>{' '}
          provides a delightful hair-pulling experience &ndash; go ahead, try it out). Also, it
          seems like NUS does not intend to improve it anytime soon. Since most of us come from the
          School of Computing, we decided to put our technical skills to use, creating something
          that will make your lives easier and better.
        </p>
        <p>
          NUSMods does not make decisions regarding your curriculum, module availability and module
          timetable. If you have questions regarding your curriculum, CORS bidding, IVLE, or
          anything unrelated to NUSMods, it would be better to either contact your faculty and
          department or just <a href="https://www.google.com/">Google</a> it.
        </p>
      </div>

      <div className={styles.question} id="wait-but-when">
        <h5>When will semester X data be available?</h5>
        <p>
          All module data shown in NUSMods is obtained from CORS. As soon as the data becomes
          available, we will reflect it here within a day or two by using the latest blockchain
          technology.
        </p>
      </div>

      <div className={styles.question}>
        <h5>
          The module NM2220 is on the CORS timetable for semester 2 but it is not on NUSMods. I hope
          you can update this.
        </h5>
        <p>
          Refer to <a href="#wait-but-when">the previous answer</a>.
        </p>
      </div>

      <div className={styles.question}>
        <h5>
          There is a mistake. On my faculty website, SC3205 is shown to have two lecture slots but
          on NUSMods there is only one lecture slot.
        </h5>
        <p>
          Yes, there is a mistake, but in most cases, <em>your faculty</em> made the mistake. Many
          faculties (FASS in particular) maintain their module timetable schedule on their faculty
          website, without updating the official school data sources such as CORS and IVLE. NUSMods
          obtains timetable data automatically from CORS and IVLE, and the only way for the updated
          data to be reflected on NUSMods is to have CORS and IVLE updated.
        </p>
        <p>
          Check <a href="https://myaces.nus.edu.sg/cors/jsp/report/ModuleInfoListing.jsp">CORS</a>{' '}
          for the official timetable data (and see if that module even exists in CORS). If it
          differs from NUSMods, do report it to us. Otherwise, inform your faculty to update the
          official sources and NUSMods will reflect the updates in time. If CORS is updated while
          NUSMods is not, give it a day or two for NUSMods to update it via our automated
          state-of-the-art artificial intelligence algorithms and machine learning models. If
          NUSMods is still not updated after two days, then there might be a problem. Please contact
          us and we will look into it.
        </p>
      </div>

      <div className={styles.question}>
        <h5>
          On my faculty website, the exam date for PS3242 is different from the one shown on
          NUSMods. It should be on 28th Nov and not 24th Nov.
        </h5>
        <p>Refer to the previous answer.</p>
      </div>

      <div className={styles.question}>
        <h5>
          I can add IS1112 into my list of modules but why are there no lectures or tutorial slots
          after adding them?
        </h5>
        <p>Refer to the previous answer.</p>
      </div>

      <div className={styles.question}>
        <h5>SE5221 cannot be found on your website, can you update your system?</h5>
        <p>Refer to the previous answer.</p>
      </div>

      <div className={styles.question}>
        <h5>
          SC3202 is indicated as only available in Sem 1 in NUSMods but the FASS module list shows
          it as available in Sem 2 too?
        </h5>
        <p>Refer to the previous answer.</p>
      </div>

      <div className={styles.question}>
        <h5>Why is ... ?</h5>
        <p>Before we hear the rest of your question, refer to the previous answer.</p>
      </div>

      <hr />

      <p>
        Congratulations for making it to the end! If you still want to contact us, you may reach us
        via email at nusmods&#123;at&#125;googlegroups[dot]com or via{' '}
        <a href={config.contact.messenger} target="_blank" rel="noopener noreferrer">
          Messenger
        </a>. Please allow up to 90 working days for a reply.
      </p>
    </StaticPage>
  );
}
