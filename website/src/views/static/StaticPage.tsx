import type { FC } from 'react';
import classnames from 'classnames';

import Title from 'views/components/Title';
import useScrollToTopEffect from 'views/hooks/useScrollToTopEffect';

type Props = {
  title: string;
  className?: string;
};

const StaticPage: FC<Props> = ({ title, className, children }) => {
  useScrollToTopEffect();
  return (
    <div className={classnames('page-container', className)}>
      <Title>{title}</Title>
      <div className="row">
        <div className="col-md-8 offset-md-1">{children}</div>
      </div>
    </div>
  );
};

export default StaticPage;
