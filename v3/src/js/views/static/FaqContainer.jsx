// @flow

import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

import StaticPage from './StaticPage';
import styles from './FaqContainer.scss';

export default function FaqContainer() {
  return (
    <StaticPage>
      <Helmet>
        <title>FAQ - {config.brandName}</title>
      </Helmet>

      <h2>Frequently Asked Questions</h2>
      <hr />
      <p>Hi there! Before contacting us, please read the following FAQ (Frequently Asked Questions) first.
        In most cases, you <strong>DO NOT</strong> need to contact us.
      </p>

      <div className={styles.question}>
        <h5>NUSMods is cool, where do you guys come from?</h5>
        <p>
          NUSMods is a student-run initiative and does not have any affiliations with the
          National University of Singapore. NUSMods was born out of the frustration of a
          lack of usable NUS timetable planners (the official one makes anyone who uses it want to pull their hair out).
          It seems like NUS does not have any intentions to improve it anytime soon anyways.
          Since most of us come from School of Computing, we decided to put our technical skills to good use to
          create something that will make your lives as students easier and better.
        </p>

        <p>NUSMods does not get to make decisions regarding your curriculum, module availablity and module timetable.
          If you have questions regarding your curriculum, CORS bidding, IVLE or anything unrelated to NUSMods,
          maybe it would be better to contact your faculty and department or
          just <a href="https://www.google.com/">Google</a> it.</p>
      </div>

      <div className={styles.question}>
        <h5>There is a mistake. On my faculty website, SC3205 is shown to have two lecture slots but on NUSMods
          there is only one lecture slot.</h5>
        <p>Yes, there is a mistake, but in most cases, it is a mistake with <em>your faculty</em>.
          Many faculties (FASS in particular) like to maintain their own module timetable schedule
          on their own faculty website,
          without updating the official school sources such as CORS and IVLE.
          NUSMods obtains timetable data automatically from CORS and IVLE,
          and the only way for the updated data to be reflected on NUSMods is to have CORS and IVLE updated.</p>
        <p>Check <a href="https://myaces.nus.edu.sg/cors/jsp/report/ModuleInfoListing.jsp">CORS</a> for
          the official timetable data (and see if that module even exists in CORS).
          Only if it differs from NUSMods, then report it to NUSMods, else,
          kindly inform your faculty to update the official sources and NUSMods will reflect the updates respectively.
          If CORS is updated while NUSMods is not,
          give it a day or two for NUSMods to update it via our automatic scripts.
          If NUSMods is still not updated after two days, then there might be a problem.
          Please contact us and we will look into it.
        </p>
      </div>

      <div className={styles.question}>
        <h5>On my faculty website, the exam date for PS3242 is different from the one shown on NUSMods.
          It should be 28th Nov 2016 1pm and not 24th Nov.
        </h5>
        <p>Refer to the answer for the previous question.</p>
      </div>

      <div className={styles.question}>
        <h5>
          I can add IS1112 into my list of modules but why are there no lectures or tutorial slots after adding them?
        </h5>
        <p>Refer to the answer for the previous question.</p>
      </div>

      <div className={styles.question}>
        <h5>SE5221 cannot be found on your website, can you update your system?</h5>
        <p>Refer to the answer for the previous question.</p>
      </div>

      <div className={styles.question}>
        <h5>
          SC3202 is indicated as only available in Sem 1 in NUSMods but
          the FASS module list shows it as available in Sem 2 too?
        </h5>
        <p>Refer to the answer for the previous question.</p>
      </div>

      <div className={styles.question}>
        <h5>Why is ... ?</h5>
        <p>
            Before we hear the rest of your question, refer to the answer for the previous question.
        </p>
      </div>

      <hr />

      <p>
        Congratulations for making it to the end! If you are still bent on contacting us,
        you may reach us via email at nusmods&#123;at&#125;googlegroups[dot]com.
        Please allow up to 90 working days for a reply.
      </p>
    </StaticPage>
  );
}
