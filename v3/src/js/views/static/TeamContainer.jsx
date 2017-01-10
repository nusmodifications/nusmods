import React from 'react';
import DocumentTitle from 'react-document-title';

type Props = {
  name: string,
  description: string,
  link: string,
  gravatar: string,
  gravatarAlt: string,
  facebook: string,
  twitter: string,
  github: string,
  linkedin: string,
}

const teamInfo = [
  {
    name: 'Beng (Eu Beng Hee)',
    description: 'He\'s Beng. Nuff\' said.',
    link: 'https://www.github.com/ahbeng',
    gravatar: 'https://www.gravatar.com/avatar/601eddec66c2e48891195af393144c17?s=256',
    gravatarAlt: 'Beng',
    facebook: 'https://www.facebook.com/benghee',
    twitter: 'https://www.twitter.com/ahbengish',
    github: 'https://www.github.com/ahbeng',
    linkedin: 'https://www.linkedin.com/in/benghee',
  },
  {
    name: 'Tay Yang Shun',
    description: 'Front-end developer who loves good code, design and typography.',
    link: 'https://www.github.com/yangshun',
    gravatar: 'https://www.gravatar.com/avatar/66eca275a85a6a0c06b0a0f7039b074b?s=256',
    gravatarAlt: 'Tay Yang Shun',
    facebook: 'https://www.facebook.com/yangshun',
    twitter: 'https://www.twitter.com/yangshunz',
    github: 'https://www.github.com/yangshun',
    linkedin: 'https://www.linkedin.com/in/yangshun',
  },
  {
    name: 'Liu Xinan',
    description: 'A crazy developer who likes magic, ...and tea!',
    link: 'https://www.github.com/xinan',
    gravatar: 'https://www.gravatar.com/avatar/802da99824fb41330a44af89256da661.png?s=256',
    gravatarAlt: 'Liu Xinan',
    facebook: 'https://www.facebook.com/xinan.liu',
    github: 'https://www.github.com/xinan',
    linkedin: 'https://www.linkedin.com/in/xinan',
  },
  {
    name: 'Ng Zhi An',
    description: 'undefined is not a function',
    link: 'https://www.github.com/ngzhian',
    gravatar: 'https://www.gravatar.com/avatar/959333b0fda0517060c9750f8c49ead0?s=256',
    gravatarAlt: 'Ng Zhi An',
    facebook: 'https://www.facebook.com/ngzhian',
    twitter: 'https://www.twitter.com/ngzhian',
    github: 'https://www.github.com/ngzhian',
    linkedin: 'https://www.linkedin.com/in/ngzhian',
  },
  {
    name: 'Li Kai',
    description: 'Happy to help.',
    link: 'https://www.github.com/li-kai',
    gravatar: 'https://www.gravatar.com/avatar/3d2bcece0409c7578b2e9d87f0c1b6d7?s=256',
    gravatarAlt: 'Li Kai',
    facebook: 'https://www.facebook.com/falconets',
    twitter: 'https://twitter.com/falconets',
    github: 'https://www.github.com/li-kai',
  },
  {
    name: 'Xu Bili',
    description: 'Loves to read and write elegant code. JavaScript enthusiast.',
    link: 'https://www.github.com/xbili',
    gravatar: 'https://www.gravatar.com/avatar/a26e376c4bc050614f13581cf6a13e09.png?s=256',
    gravatarAlt: 'Xu Bili',
    facebook: 'https://www.facebook.com/xbili',
    twitter: 'https://www.twitter.com/lantis_play',
    github: 'https://www.github.com/xbili',
    linkedin: 'https://www.linkedin.com/in/xbili',
  },
  {
    name: 'Ang Yen Ling',
    description: 'Bubbly girl who loves new things, matcha ice cream and marketing.',
    link: 'https://www.facebook.com/ang.yenling',
    gravatar: 'https://www.gravatar.com/avatar/630fe6848c11082312b57b1360a0dd09?s=256',
    gravatarAlt: 'Ang Yen Ling',
    facebook: 'https://www.facebook.com/ang.yenling',
    linkedin: 'https://www.linkedin.com/in/yen-ling-ang-a56158b6',
  },
];

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
            <TeamMember name={teamMember.name}
              description={teamMember.description}
              link={teamMember.link}
              gravatar={teamMember.gravatar}
              gravatarAlt={teamMember.gravatarAlt}
              twitter={teamMember.twitter}
              facebook={teamMember.facebook}
              linkedin={teamMember.linkedin}
              github={teamMember.github}
              key={index}
            />
          )}
        </div>
      </div>
    </DocumentTitle>
  );
}

function TeamMember(props: Props) {
  return (
    <div>
      <hr />
      <div className="row">
        <div className="col-sm-3 col-xs-12">
          <a href="https://www.github.com/ahbeng">
            <img className="img-fluid" src={props.gravatar}
              alt={props.gravatarAlt} />
          </a>
        </div>
        <div className="col-sm-9 col-xs-12">
          <h3>{props.name}</h3>
          <p>{props.description}</p>
          <div className="row">
            <div className="col-sm-1 col-xs-3">
              <a href={props.facebook}><i className="fa fa-facebook-square fa-lg" /></a>
            </div>
            <div className="col-sm-1 col-xs-3">
              <a href={props.twitter}><i className="fa fa-twitter fa-lg" /></a>
            </div>
            <div className="col-sm-1 col-xs-3">
              <a href={props.linkedin}><i className="fa fa-linkedin fa-lg" /></a>
            </div>
            <div className="col-sm-1 col-xs-3">
              <a href={props.github}><i className="fa fa-github-square fa-lg"/></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
