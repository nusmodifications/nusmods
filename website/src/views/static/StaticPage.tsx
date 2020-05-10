import * as React from 'react';
import classnames from 'classnames';

import ScrollToTop from 'views/components/ScrollToTop';
import Title from 'views/components/Title';

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

const StaticPage: React.FC<Props> = (props) => (
  <div className={classnames('page-container', props.className)}>
    <ScrollToTop onComponentDidMount />
    <Title>{props.title}</Title>
    <div className="row">
      <div className="col-md-8 offset-md-1">{props.children}</div>
    </div>
  </div>
);

export default StaticPage;
