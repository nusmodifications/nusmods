// flow-typed signature: cf133f0012ae4e201365980e4b444c98
// flow-typed version: <<STUB>>/react-flip-toolkit_v6.3.1/flow_v0.87.0

import * as React from 'react';

declare module 'react-flip-toolkit' {
  declare export type Spring = {
    stiffness?: number,
    damping?: number,
    overshootClamping?: boolean,
  };

  declare export type SpringConfig =
    | 'stiff'
    | 'noWobble'
    | 'veryGentle'
    | 'gentle'
    | 'wobbly'
    | Spring;

  declare export type FlippedProps = {
    children: React.ReactNode,
    inverseFlipId?: string,
    flipId?: string,
    opacity?: boolean,
    translate?: boolean,
    scale?: boolean,
    transformOrigin?: string,
    stagger?: string | boolean,
    spring?: SpringConfig,
    onStart?: (element: HTMLElement) => void,
    onComplete?: (element: HTMLElement) => void,
    onAppear?: (element: HTMLElement, index: number) => void,
    onExit?: (element: HTMLElement, index: number, removeElement: () => void) => void,
    shouldFlip?: (prevDecisionData: any, currentDecisionData: any) => boolean,
    shouldInvert?: (prevDecisionData: any, currentDecisionData: any) => boolean,
    portalKey?: string,
  };

  declare export class Flipped extends React.ComponentType<FlippedProps> {}

  declare export type StaggerConfigValue = {
    reverse?: boolean,
    speed: number,
  };

  declare export type StaggerConfig = {
    [key: string]: StaggerConfigValue,
  };

  declare export type HandleEnterUpdateDeleteArgs = {
    hideEnteringElements: () => void,
    animateExitingElements: () => Promise<void>,
    animateFlippedElements: () => Promise<void>,
    animateEnteringElements: () => void,
  };

  declare export type FlipperProps = {
    flipKey: any,
    children: React.ReactNode,
    spring?: SpringConfig,
    applyTransformOrigin?: boolean,
    debug?: boolean,
    element?: string,
    className?: string,
    portalKey?: string,
    decisionData?: any,
    handleEnterUpdateDelete?: (args: HandleEnterUpdateDeleteArgs) => void,
    staggerConfig?: StaggerConfig,
  };

  declare export class Flipper extends React.ComponentType<FlipperProps> {}

  declare export type ExitContainerProps = {
    children: React.ReactNode,
  };

  declare export class ExitContainer extends React.SFC<ExitContainerProps> {}
}
