import * as React from 'react';
import classnames from 'classnames';
import { flatten, values } from 'lodash';
import LinkModuleCodes from 'views/components/LinkModuleCodes';

import { ModuleCode, PrereqTree } from 'types/modules';

import { notNull } from 'types/utils';
import styles from './ModuleTree.scss';

type Props = {
  moduleCode: ModuleCode;
  fulfillRequirements?: readonly ModuleCode[];
  prereqTree?: PrereqTree;
};

interface TreeDisplay {
  layer: number;
  node: PrereqTree;
  isPrereq?: boolean;
}

const GRADE_REQUIREMENT_SEPARATOR = ':';
const MODULE_NAME_WILDCARD = '%';
const PASSING_GRADE = 'D';

const formatConditional = (name: string) => (name === 'or' ? 'one of' : 'all of');

const nodeName = (node: PrereqTree) => {
  let name = typeof node === 'string' ? node : Object.keys(node)[0];
  if (name.includes(GRADE_REQUIREMENT_SEPARATOR)) {
    const [moduleName, requiredGrade] = name.split(GRADE_REQUIREMENT_SEPARATOR);
    if (requiredGrade !== PASSING_GRADE) {
      name = `${moduleName} (grade of at least ${requiredGrade})`;
    } else {
      name = moduleName;
    }
  }
  if (name.includes(MODULE_NAME_WILDCARD)) {
    const [beforeWildcard, afterWildcard] = name.split(MODULE_NAME_WILDCARD);
    name = `course that starts with "${beforeWildcard}" ${afterWildcard}`;
  }
  return name;
};

const unwrapLayer = (node: PrereqTree) =>
  typeof node === 'string' ? [node] : flatten(values(node).filter(notNull));

const Branch: React.FC<{ nodes: PrereqTree[]; layer: number }> = (props) => (
  <ul className={styles.tree}>
    {props.nodes.map((child) => (
      <li className={styles.branch} key={nodeName(child)}>
        <Tree node={child} layer={props.layer} />
      </li>
    ))}
  </ul>
);

const Tree: React.FC<TreeDisplay> = (props) => {
  const { layer, node, isPrereq } = props;

  const isConditional = typeof node !== 'string';
  const name = nodeName(node);

  return (
    <>
      <div
        className={classnames(styles.node, {
          [`hoverable color-${layer}`]: !isConditional,
          [styles.conditional]: isConditional,
          [styles.prereqNode]: isPrereq,
        })}
      >
        {isConditional ? (
          formatConditional(name)
        ) : (
          <LinkModuleCodes className={styles.link}>{name}</LinkModuleCodes>
        )}
      </div>

      {isConditional && <Branch nodes={unwrapLayer(node)} layer={layer + 1} />}
    </>
  );
};

const ModuleTree: React.FC<Props> = (props) => {
  const { fulfillRequirements, prereqTree, moduleCode } = props;

  return (
    <>
      <div className={styles.container}>
        {fulfillRequirements && fulfillRequirements.length > 0 && (
          <>
            <ul className={styles.prereqTree}>
              {fulfillRequirements.map((fulfilledModule) => (
                <li
                  key={fulfilledModule}
                  className={classnames(styles.branch, styles.prereqBranch)}
                >
                  <Tree layer={0} node={fulfilledModule} isPrereq />
                </li>
              ))}
            </ul>

            <div className={classnames(styles.node, styles.conditional)}>needs</div>
          </>
        )}

        <ul className={classnames(styles.tree, styles.root)}>
          <li className={classnames(styles.branch)}>
            <Tree layer={1} node={moduleCode} />

            {prereqTree && <Branch nodes={[prereqTree]} layer={2} />}
          </li>
        </ul>
      </div>

      {/* <p className="alert alert-warning">
        The prerequisite tree is displayed for visualization purposes and may not be accurate.
        Viewers are encouraged to double check details.
      </p> */}

      <p className="alert alert-warning">
        This new version of the prerequisite tree is being tested and may not be accurate. Viewers
        are encouraged to double check details with the prerequisite text above. To report bugs with
        the new tree, please post a bug report on GitHub (preferred) at{' '}
        <a
          href="https://github.com/nusmodifications/nusmods/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          our repository
        </a>{' '}
        or send an email to{' '}
        <a href="mailto:bugs@nusmods.com" target="_blank" rel="noopener noreferrer nofollow">
          bugs@nusmods.com
        </a>
        .
      </p>
    </>
  );
};

export default ModuleTree;
