import { Card } from 'components/ui/card';
import type { FC, PropsWithChildren } from 'react';
import classnames from 'classnames';

import Title from 'views/components/Title';
import useScrollToTop from 'views/hooks/useScrollToTop';

type Props = {
  title: string;
  className?: string;
};

const StaticPage: FC<PropsWithChildren<Props>> = ({ title, className, children }) => {
  useScrollToTop();
  return (
    <div className={classnames('page-container', className)}>
      <Title>{title}</Title>
      <div className="row">
        <div className="col-xl-10">
          <Card className="static-page-content">{children}</Card>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
