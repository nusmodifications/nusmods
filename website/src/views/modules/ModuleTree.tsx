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

const formatConditional = (name: string) => (name === 'or' ? 'one of' : 'all of');

const nodeName = (node: PrereqTree) => (typeof node === 'string' ? node : Object.keys(node)[0]);

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
      {isConditional && <Branch nodes={unwrapLayer(node)} layer={layer + 1} />}
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
    </>
  );
};

const ModuleTree: React.FC<Props> = (props) => {
  const { fulfillRequirements, prereqTree, moduleCode } = props;

  console.log(prereqTree);

  return (
    <>
      <div className={styles.container}>
        <ul className={classnames(styles.tree, styles.root)}>
          <li className={classnames(styles.branch)}>
            {prereqTree && <Branch nodes={[prereqTree]} layer={2} />}
          </li>
        </ul>
        <ul className={classnames(styles.tree, styles.root)}>
          <li className={classnames(styles.branch)}>
            <Tree layer={1} node={moduleCode} />
          </li>
        </ul>

        <div className={classnames(styles.node, styles.conditional)}>needs</div>

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
          </>
        )}
      </div>

      <p className="alert alert-warning">
        The prerequisite tree is displayed for visualization purposes and may not be accurate.
        Viewers are encouraged to double check details.
      </p>
    </>
  );
};

export default ModuleTree;
