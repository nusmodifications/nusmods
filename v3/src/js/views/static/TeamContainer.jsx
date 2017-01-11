import React from 'react';
import DocumentTitle from 'react-document-title';

import teamInfo from 'data/team.json';

export default function TeamContainer() {
  return (
    <DocumentTitle title="Team">
      <div className="row">
        <div className="col-md-8 offset-md-1">
          <h2>Team</h2>
          <hr />
          <p><em>NUSMods is an open source project that relies on
          the continuous support of its individual contributors and NUS student community.
          We hope to involve more developers and contributors in making NUSMods even better.
          Please reach out to us if you are interested in helping!</em></p>
          <p>These are the members of our core team:</p>
          {teamInfo.map((teamMember, index) =>
            <div key={index}>
              <hr />
              <div className="row">
                <div className="col-sm-3 col-xs-12">
                  <a href={teamMember.github}>
                    <img className="img-fluid" src={teamMember.gravatar}
                      alt={teamMember.gravatarAlt} />
                  </a>
                </div>
                <div className="col-sm-9 col-xs-12">
                  <h3>{teamMember.name}</h3>
                  <p>{teamMember.description}</p>
                  <div className="row">
                    {teamMember.facebook &&
                      <div className="col-sm-1 col-xs-3">
                        <a href={teamMember.facebook}><i className="fa fa-facebook-square fa-lg" /></a>
                      </div>
                    }
                    {teamMember.twitter &&
                      <div className="col-sm-1 col-xs-3">
                        <a href={teamMember.twitter}><i className="fa fa-twitter fa-lg" /></a>
                      </div>
                    }
                    {teamMember.linkedin &&
                      <div className="col-sm-1 col-xs-3">
                        <a href={teamMember.linkedin}><i className="fa fa-linkedin fa-lg" /></a>
                      </div>
                    }
                    {teamMember.github &&
                      <div className="col-sm-1 col-xs-3">
                        <a href={teamMember.github}><i className="fa fa-github-square fa-lg"/></a>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DocumentTitle>
  );
}
