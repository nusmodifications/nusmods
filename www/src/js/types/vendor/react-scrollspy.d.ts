declare module 'react-scrollspy' {
  import * as React from 'react';

  interface ScrollSpyProps {
    // Array of target element IDs
    items: string[];

    // Class name that apply to the navigation element paired with the content element in viewport
    currentClassName: string;

    // Class name that apply to the navigation elements that have been scrolled past
    scrolledPastClassName?: string;

    // HTML tag for Scrollspy component if you want to use other than ul
    componentTag?: string;

    // Style attribute to be passed to the generated <ul /> element
    style?: React.CSSProperties;

    // Offset value that adjusts to determine the elements are in the viewport
    offset?: number;

    // Selector for the element of scrollable container that can be used with querySelector
    rootEl?: string;

    // Function to be executed when the active item has been updated
    onUpdate?: (item: string) => void;
  }

  export default class ScrollSpy extends React.Component<ScrollSpyProps> {
    // Add event listener of scrollspy.
    onEvent(): void;

    // Remove event listener of scrollspy.
    offEvent(): void;
  }
}
