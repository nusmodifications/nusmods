// @flow
import React from 'react';
import DocumentTitle from 'react-document-title';
import config from 'config';

function ModulesContainer(props: { children: React.Children }) {
  return (
    <DocumentTitle title={`Modules - ${config.brandName}`}>
      <div className="modules-page-container page-container">
        {props.children}
      </div>
    </DocumentTitle>
  );
}

export default ModulesContainer;
