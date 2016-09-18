import React, { PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import config from 'config';

const ModulesContainer = (props) => {
  return (
    <DocumentTitle title={`Modules - ${config.brandName}`}>
      <div className="modules-page-container page-container">
        {props.children}
      </div>
    </DocumentTitle>
  );
};

ModulesContainer.propTypes = {
  children: PropTypes.object,
};

export default ModulesContainer;
