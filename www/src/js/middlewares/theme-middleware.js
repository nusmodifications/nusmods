// @flow
import type { Middleware, MiddlewareAPI } from 'redux';
import { mapValues, each, pick, flatMap, difference, uniq, isEqual } from 'lodash';
import type { State } from 'reducers';
import type { SemTimetableConfig } from 'types/timetables';
import { setColorMap } from 'actions/theme';
import { fillColorMapping } from 'utils/colors';

/**
 * This middleware keeps the theme color mapping for modules up to date.
 * It enforces the following invariants
 *  - All modules in the timetables must have a color
 *  - All colors in the color map must correspond to a module
 *  - When picking new colors, avoid duplicating colors as much as possible within
 *    the same semester
 */
const themeMiddleware: Middleware<State, *, *> = (store: MiddlewareAPI<State, *, *>) => (
  next: *,
) => (action: *) => {
  // Run this after the action has been consumed
  const prevState = store.getState();
  next(action);
  const nextState = store.getState();

  // Update the theme colors only if the timetable has changed
  if (nextState.timetables !== prevState.timetables) {
    // mapValues call is defensive - in theory all values should already be numbers
    let colors = mapValues(nextState.theme.colors, Number);
    const modules = new Set();

    each(nextState.timetables, (timetable: SemTimetableConfig) => {
      each(timetable, (lesson, moduleCode) => modules.add(moduleCode));

      // Add colors to modules without them
      colors = {
        ...colors,
        ...fillColorMapping(timetable, colors),
      };
    });

    // Remove colors for modules which aren't on the timetable anymore
    colors = pick(colors, Array.from(modules));

    // Invariant check
    if (process.env.NODE_ENV === 'development') {
      const timetableModules = uniq(flatMap(nextState.timetables, Object.keys));
      const colorModules = Object.keys(colors);

      if (
        difference(timetableModules, colorModules).length ||
        difference(colorModules, timetableModules).length
      ) {
        // eslint-disable-next-line no-console
        console.error(
          `INVARIANT: theme-middleware: Color map module codes and timetable module codes do not match`,
          nextState.timetables,
          colors,
        );
      }
    }

    if (!isEqual(colors, nextState.theme.colors)) {
      store.dispatch(setColorMap(colors));
    }
  }
};

export default themeMiddleware;
