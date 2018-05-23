// @flow

export type PageTemplateData = {
  // Provided by React Helmet
  htmlAttributes?: string,
  bodyAttributes?: string,
  titleTag: string,
  metaTags?: string,
  linkTags?: string,

  // For the React app and Redux store
  app?: string,
  script?: string,
};
