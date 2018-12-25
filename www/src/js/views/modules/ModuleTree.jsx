// @flow
import React, { Fragment } from 'react';
import classnames from 'classnames';
import _ from 'lodash';

import { NUM_DIFFERENT_COLORS } from 'utils/colors';
import LinkModuleCodes from 'views/components/LinkModuleCodes';

import type { Module } from 'types/modules';

import styles from './ModuleTree.scss';

type Props = {
  module: Module,
};

type TreeDisplay = {
  layer: number,
  name: string,
  isPrereq?: boolean,
  // TreeDisplay[] will result in infinite loop
  branches: ?Array<TreeDisplay>,
};

function isConditionalNode(name) {
  return name === 'or' || name === 'and';
}
function formatConditional(name) {
  return name === 'or' ? 'one of' : 'all of';
}
function incrementLayer(layer: number, name: string) {
  return isConditionalNode(name) ? layer : (layer + 1) % NUM_DIFFERENT_COLORS;
}

function Branch({ layer, branches }: { layer: number, branches: TreeDisplay[] }) {
  return (
    <ul className={styles.tree}>
      {branches.map((child) =>
        _.castArray(child).map((subchild) => (
          <Tree
            key={subchild.name}
            layer={incrementLayer(layer, subchild.name)}
            name={subchild.name}
            branches={subchild.children}
          />
        )),
      )}
    </ul>
  );
}

function Tree({ layer, name, branches, isPrereq = false }: TreeDisplay) {
  const isConditional = isConditionalNode(name);
  return (
    <li
      className={classnames(styles.branch, {
        [styles.prereqBranch]: isPrereq,
      })}
    >
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
      {branches &&
        branches.length > 0 && <Branch layer={incrementLayer(layer, name)} branches={branches} />}
    </li>
  );
}

function ModuleTree(props: Props) {
  const modTree = props.module.ModmavenTree;
  const lockedModules = props.module.LockedModules;
  return (
    <div className={styles.container}>
      {lockedModules &&
        lockedModules.length > 0 && (
          <Fragment>
            <ul className={styles.prereqTree}>
              {lockedModules.map((name) => (
                <Tree key={name} layer={0} name={name} branches={null} isPrereq />
              ))}
            </ul>
            <div className={classnames(styles.node, styles.conditional)}>needs</div>
          </Fragment>
        )}
      <ul className={classnames(styles.tree, styles.root)}>
        <Tree layer={1} name={modTree.name} branches={_.castArray(modTree.children)} />
      </ul>
    </div>
  );
}

export default ModuleTree;
// For testing
export { incrementLayer };
