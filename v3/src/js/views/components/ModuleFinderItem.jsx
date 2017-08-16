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
      <header>
        <h2 className="modules-title">
          <Link to={modulePagePath(module.ModuleCode)}>
            {module.ModuleCode} {module.ModuleTitle}
          </Link>
        </h2>

        Semesters offered:&nbsp;
        <ol className="modules-semesters-list list-unstyled list-inline">
          {module.History.map((semesterData) => (
            <li className="modules-semesters-item list-inline-item" key={semesterData.Semester}>
              {semesterData.Semester}</li>
          ))}
        </ol>
      </header>

      <p>{ module.ModuleDescription }</p>

      <footer>
        <p>
          <a>{ module.Department }</a> &middot;&nbsp;
          <a>{ module.ModuleCredit } MC</a>
        </p>
      </footer>
    </li>
  );
}
