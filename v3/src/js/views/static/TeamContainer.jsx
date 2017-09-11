import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

import teamInfo from 'data/team.json';

export default function TeamContainer() {
  return (
    <div className="row">
      <Helmet>
        <title>Team - {config.brandName}</title>
      </Helmet>
      <div className="col-md-8 offset-md-1">
        <h2>Team</h2>
        <hr />
        <p><em>NUSMods is an open source project that relies on
          the continuous support of its individual contributors and NUS student community.
          We hope to involve more developers and contributors in making NUSMods even better.
          Please reach out to us if you are interested in helping!</em></p>
        <p>These are the members of our core team:</p>
        {teamInfo.map((teamMember, index) => (
          <div key={index}>
            <hr />
            <div className="row">
              <div className="col-sm-3 col-xs-12">
                <a href={teamMember.github}>
                  <img
                    className="img-fluid"
                    src={teamMember.gravatar}
                    alt={teamMember.gravatarAlt}
                  />
                </a>
              </div>
              <div className="col-sm-9 col-xs-12">
                <h3>{teamMember.name}</h3>
                <p>{teamMember.description}</p>
                <div className="row">
                  {teamMember.facebook &&
                  <div className="col-sm-1 col-xs-3">
                    <a href={teamMember.facebook} title="Facebook profile" aria-label="Facebook profile">
                      <i className="fa fa-facebook-square fa-lg" aria-hidden="true" />
                    </a>
                  </div>
                  }
                  {teamMember.twitter &&
                  <div className="col-sm-1 col-xs-3">
                    <a href={teamMember.twitter} title="Twitter feed" aria-label="Twitter feed">
                      <i className="fa fa-twitter fa-lg" aria-hidden="true" />
                    </a>
                  </div>
                  }
                  {teamMember.linkedin &&
                  <div className="col-sm-1 col-xs-3">
                    <a href={teamMember.linkedin} title="LinkedIn profile" aria-label="LinkedIn profile">
                      <i className="fa fa-linkedin fa-lg" aria-hidden="true" />
                    </a>
                  </div>
                  }
                  {teamMember.github &&
                  <div className="col-sm-1 col-xs-3">
                    <a href={teamMember.github} title="GitHub profile" aria-label="GitHub profile" >
                      <i className="fa fa-github-square fa-lg" aria-hidden="true" />
                    </a>
                  </div>
                  }
                </div>
              </div>
            </div>
          </div>),
        )}
      </div>
    </div>
  );
}
