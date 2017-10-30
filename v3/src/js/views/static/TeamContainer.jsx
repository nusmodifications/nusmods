// @flow

import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

import { Facebook, LinkedIn, GitHub, Twitter } from 'views/components/icons';

import teamMembers from 'data/team.json';
import StaticPage from './StaticPage';
import styles from './TeamContainer.scss';

function renderTeamMember(member) {
  return (
    <section className={styles.teamMember} key={member.name}>
      <div className="row">
        <div className="col-lg-2 col-sm-3 text-center-md">
          <a href={member.github} className={`${styles.portrait}`}>
            <img
              className="rounded-circle img-fluid img-thumbnail"
              src={member.gravatar}
              alt={member.gravatarAlt}
            />
          </a>
        </div>
        <div className="col-lg-10 col-sm-9">
          <h4>{member.name}</h4>
          <p>{member.description}</p>
          <div className="row">
            {member.facebook &&
              <div className="col-sm-1 col">
                <a href={member.facebook} title="Facebook profile" aria-label="Facebook profile">
                  <Facebook />
                </a>
              </div>
            }

            {member.twitter &&
              <div className="col-sm-1 col">
                <a href={member.twitter} title="Twitter profile" aria-label="Twitter profile">
                  <Twitter />
                </a>
              </div>
            }

            {member.github &&
              <div className="col-sm-1 col">
                <a href={member.github} title="GitHub profile" aria-label="GitHub profile" >
                  <GitHub />
                </a>
              </div>
            }

            {member.linkedin &&
              <div className="col-sm-1 col">
                <a href={member.linkedin}>
                  <LinkedIn />
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TeamContainer() {
  return (
    <StaticPage>
      <Helmet>
        <title>Team - {config.brandName}</title>
      </Helmet>

      <h2>Team</h2>
      <hr />
      <p>NUSMods is an open source project that relies on the continuous support of its
        individual contributors and NUS student community. We hope to involve more developers
        and contributors in making NUSMods even better. Please reach out to us if you are interested in helping!
      </p>

      <h4 className={styles.heading}>NUSMods Core (Active)</h4>
      {teamMembers.filter(member => member.active).map(member => renderTeamMember(member))}
      <hr />

      <h4 className={styles.heading}>NUSMods Alumni</h4>
      {teamMembers.filter(member => !member.active).map(member => renderTeamMember(member))}
      <hr />

      <small>LinkedIn icon from <a href="https://icons8.com/">Icons8</a></small>
    </StaticPage>
  );
}
