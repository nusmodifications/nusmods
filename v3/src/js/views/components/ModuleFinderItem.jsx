// @flow
import React from 'react';
import { Link } from 'react-router-dom';

import { modulePagePath } from 'utils/modules';
import type { Module } from 'types/modules';

type Props = {
  module: Module,
};

export default function ModuleFinderItem(props: Props) {
  const { module } = props;

  return (
    <li className="modules-item">
      <h2 className="modules-title">
        <Link to={modulePagePath(module.ModuleCode)}>
          {module.ModuleCode} {module.ModuleTitle}
        </Link>
      </h2>
      <ol className="modules-semesters-list">
        Semesters offered:&nbsp;
        {module.History.map(semesterData => (
          <li className="modules-semesters-item">{semesterData.Semester}</li>
        ))}
      </ol>
    </li>
  );
}
