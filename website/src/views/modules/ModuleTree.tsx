import * as React from 'react';
import classnames from 'classnames';
import { flatten, values } from 'lodash';
import { connect } from 'react-redux';

import { getModuleCondensed } from 'selectors/moduleBank';

import { ModuleCode, PrereqTree, ModuleCondensed } from 'types/modules';
import { State } from 'types/state';
import { notNull } from 'types/utils';

import LinkModuleCodes from 'views/components/LinkModuleCodes';
import styles from './ModuleTree.scss';

type Props = {
  moduleCode: ModuleCode;
  fulfillRequirements?: readonly ModuleCode[];
  prereqTree?: PrereqTree;

  getModuleCondensed: (moduleCode: ModuleCode) => ModuleCondensed | undefined;
};

interface TreeDisplay {
  layer: number;
  node: PrereqTree;
  isPrereq?: boolean;

  getModuleCondensed: (moduleCode: ModuleCode) => ModuleCondensed | undefined;
}

const GRADE_REQUIREMENT_SEPARATOR = ':';
const MODULE_NAME_WILDCARD = '%';
const PASSING_GRADE = 'D';

const formatConditional = (node: PrereqTree) => {
  if (typeof node === 'string') return node;
  if ('nOf' in node) {
    const requiredNum = node.nOf[0];
    return `at least ${requiredNum} of`;
  }
  if ('or' in node) {
    return 'one of';
  }
  return 'all of';
};

type NodeName = {
  prefix?: string;
  name: string;
};
const nodeName = (node: PrereqTree): NodeName => {
  if (typeof node !== 'string') {
    return { name: Object.keys(node)[0] };
  }
  const res: NodeName = { name: node };
  if (res.name.includes(GRADE_REQUIREMENT_SEPARATOR)) {
    const [moduleName, requiredGrade] = res.name.split(GRADE_REQUIREMENT_SEPARATOR);
    if (requiredGrade !== PASSING_GRADE) {
      res.prefix = `Minimally ${requiredGrade} for`;
    }
    res.name = moduleName;
  }
  if (res.name.includes(MODULE_NAME_WILDCARD)) {
    const [beforeWildcard, afterWildcard] = res.name.split(MODULE_NAME_WILDCARD);
    res.prefix = 'Course starting with';
    res.name = `"${beforeWildcard}" ${afterWildcard}`;
  }
  res.prefix?.trim();
  res.name.trim();
  return res;
};

const unwrapLayer = (node: PrereqTree) => {
  if (typeof node === 'string') {
    return [node];
  }
  if ('nOf' in node) {
    return node.nOf[1];
  }
  return flatten(values(node).filter(notNull));
};

const Branch: React.FC<{
  nodes: PrereqTree[];
  layer: number;
  getModuleCondensed: (moduleCode: ModuleCode) => ModuleCondensed | undefined;
}> = (props) => (
  <ul className={styles.tree}>
    {props.nodes.map((child, idx) => (
      <li className={styles.branch} key={typeof child === 'string' ? nodeName(child).name : idx}>
        <Tree node={child} layer={props.layer} getModuleCondensed={props.getModuleCondensed} />
      </li>
    ))}
  </ul>
);

const Tree: React.FC<TreeDisplay> = (props) => {
  const { layer, node, isPrereq } = props;

  const isConditional = typeof node !== 'string';
  const { prefix, name } = nodeName(node);

  if (isConditional) {
    return (
      <>
        <div
          className={classnames(styles.node, styles.conditional, {
            [styles.prereqNode]: isPrereq,
          })}
        >
          {formatConditional(node)}
        </div>
        <Branch
          nodes={unwrapLayer(node)}
          layer={layer + 1}
          getModuleCondensed={props.getModuleCondensed}
        />
      </>
    );
  }

  // Check if module name still exists in database
  const moduleActive = props.getModuleCondensed(name);

  // If module is deprecated (undefined) then we grey out, remove color classname

  return (
    <div
      className={classnames(styles.node, styles.moduleNode, {
        [`hoverable color-${layer}`]: !!moduleActive,
        [styles.prereqNode]: isPrereq,
      })}
    >
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <LinkModuleCodes className={styles.link}>{name}</LinkModuleCodes>
    </div>
  );
};

export const ModuleTreeComponent: React.FC<Props> = (props) => {
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
                  <Tree
                    layer={0}
                    node={fulfilledModule}
                    isPrereq
                    getModuleCondensed={props.getModuleCondensed}
                  />
                </li>
              ))}
            </ul>

            <div className={classnames(styles.node, styles.conditional)}>needs</div>
          </>
        )}

        <ul className={classnames(styles.tree, styles.root)}>
          <li className={classnames(styles.branch)}>
            <Tree layer={1} node={moduleCode} getModuleCondensed={props.getModuleCondensed} />

            {prereqTree && (
              <Branch
                nodes={[prereqTree]}
                layer={2}
                getModuleCondensed={props.getModuleCondensed}
              />
            )}
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

const mapStateToProps = connect((state: State) => ({
  getModuleCondensed: getModuleCondensed(state),
}));

export default mapStateToProps(ModuleTreeComponent);
