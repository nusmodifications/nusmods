import * as React from 'react';
import { Facebook, Linkedin, GitHub, Twitter } from 'react-feather';

import ExternalLink from 'views/components/ExternalLink';
import Tooltip from 'views/components/Tooltip';
import teamMembers from 'data/team.json';
import StaticPage from './StaticPage';
import styles from './TeamContainer.scss';

type Props = {
  member: {
    name: string;
    description: string;
    active?: boolean;
    link: string;
    gravatar: string;
    gravatarAlt: string;
    facebook?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
};

const title = 'Team';

const TeamMember: React.FC<Props> = ({ member }) => (
  <section className={styles.teamMember} key={member.name}>
    <div className="row">
      <div className="col-lg-2 col-sm-3 text-center-md">
        <ExternalLink href={member.link} className={styles.portrait}>
          <img
            className="rounded-circle img-fluid img-thumbnail"
            src={`https://www.gravatar.com/avatar/${member.gravatar}?s=256`}
            alt={member.gravatarAlt}
          />
        </ExternalLink>
      </div>
      <div className="col-lg-10 col-sm-9">
        <h4>{member.name}</h4>
        <p>{member.description}</p>
        <div className="row">
          {member.facebook && (
            <div className="col-sm-1 col">
              <Tooltip content="Facebook profile" touch="hold">
                <ExternalLink
                  href={`https://www.facebook.com/${member.facebook}`}
                  aria-label="Facebook profile"
                >
                  <Facebook />
                </ExternalLink>
              </Tooltip>
            </div>
          )}

          {member.twitter && (
            <div className="col-sm-1 col">
              <Tooltip content="Twitter profile" touch="hold">
                <ExternalLink
                  href={`https://www.twitter.com/${member.twitter}`}
                  aria-label="Twitter profile"
                >
                  <Twitter />
                </ExternalLink>
              </Tooltip>
            </div>
          )}

          {member.github && (
            <div className="col-sm-1 col">
              <Tooltip content="GitHub profile" touch="hold">
                <ExternalLink
                  href={`https://www.github.com/${member.github}`}
                  aria-label="GitHub profile"
                >
                  <GitHub />
                </ExternalLink>
              </Tooltip>
            </div>
          )}

          {member.linkedin && (
            <div className="col-sm-1 col">
              <Tooltip content="Linkedin profile" touch="hold">
                <ExternalLink
                  href={`https://www.linkedin.com/in/${member.linkedin}`}
                  aria-label="Linkedin profile"
                >
                  <Linkedin />
                </ExternalLink>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

const TeamContainer: React.FC = () => (
  <StaticPage title={title}>
    <h2>{title}</h2>
    <hr />
    <p>
      NUSMods is an open source project that relies on the continuous support of its individual
      contributors and NUS student community. We hope to involve more developers and contributors in
      making NUSMods even better. Please reach out to us if you are interested in helping!
    </p>

    <h4 className={styles.heading}>NUSMods Core (Active)</h4>
    {teamMembers
      .filter((member) => member.active)
      .map((member) => (
        <TeamMember key={member.name} member={member} />
      ))}
    <hr />

    <h4 className={styles.heading}>NUSMods Alumni</h4>
    {teamMembers
      .filter((member) => !member.active)
      .map((member) => (
        <TeamMember key={member.name} member={member} />
      ))}
  </StaticPage>
);

export default TeamContainer;
