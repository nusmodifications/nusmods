module.exports = (babel) => {
  const { types: t } = babel;
  const GLOBAL_EXPOSURE_IDENTIFIER = 'babelPluginExposePrivates';
  const HOIST_PRAGMA = 'babel-plugin-expose-privates';
  const identifiers = new Set();

  function attachToGlobalObject(path, identifierName) {
    identifiers.add(identifierName);
    // Attach to global object to be exposed for exporting later.
    path.insertAfter(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier(GLOBAL_EXPOSURE_IDENTIFIER),
            t.identifier(identifierName),
          ),
          t.identifier(identifierName),
        ),
      ),
    );
  }

  return {
    visitor: {
      Program: {
        enter: function(path) {
          // Inject a global object for us to inject the exports into.
          path.node.body.unshift(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(GLOBAL_EXPOSURE_IDENTIFIER),
                t.objectExpression([]),
              ),
            ]),
          );
        },
        exit: function(path) {
          if (identifiers.size === 0) {
            return;
          }
          identifiers.forEach((id) => {
            const variableInGlobalScope = path.scope.hasOwnBinding(id);
            // If not in global scope, declare it in global scope.
            if (!variableInGlobalScope) {
              path.node.body.push(
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier(id),
                    t.memberExpression(t.identifier(GLOBAL_EXPOSURE_IDENTIFIER), t.identifier(id)),
                  ),
                ]),
              );
            }
          });
          // Add the export statements.
          path.node.body.push(
            t.exportNamedDeclaration(
              null,
              Array.from(identifiers).map((id) =>
                t.exportSpecifier(t.identifier(id), t.identifier(id)),
              ),
            ),
          );
        },
      },
      'FunctionDeclaration|ClassDeclaration'(path) {
        if (!path.node.leadingComments || path.node.leadingComments.length === 0) {
          return;
        }
        const lastCommentValue =
          path.node.leadingComments[path.node.leadingComments.length - 1].value;
        if (lastCommentValue.includes(HOIST_PRAGMA)) {
          attachToGlobalObject(path, path.node.id.name);
        }
      },
      VariableDeclaration(path) {
        if (!path.node.leadingComments || path.node.leadingComments.length === 0) {
          return;
        }
        const lastCommentValue =
          path.node.leadingComments[path.node.leadingComments.length - 1].value;
        if (
          !(
            lastCommentValue.includes(HOIST_PRAGMA) &&
            path.node.declarations &&
            path.node.declarations.length > 0
          )
        ) {
          return;
        }
        path.node.declarations.forEach((node) => {
          const id = node.id;
          switch (id.type) {
            case 'Identifier':
              // Handle cases like: const a = 'foo';
              attachToGlobalObject(path, id.name);
              break;
            case 'ObjectPattern':
              // Handle cases like: const { a, b, c } = obj;
              id.properties.forEach((property) => {
                if (property.computed || !property.key) {
                  return;
                }
                attachToGlobalObject(path, property.key.name);
              });
            default:
              break;
          }
        });
      },
    },
  };
};
