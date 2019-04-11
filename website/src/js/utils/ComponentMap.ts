import { ComponentMap as ComponentMapType } from 'types/views';

// Singleton containing references to HTML elements from various parts of
// the app. This is used by KeyboardShortcuts to focus or activate DOM elements
// when shortcuts are activated.
//
// DO NOT store objects stored here in local variables, otherwise you will get
// memory leaks
const ComponentMap: ComponentMapType = {
  globalSearchInput: null,
  downloadButton: null,
};

export default ComponentMap;
