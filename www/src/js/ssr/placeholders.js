// @flow
import config from 'config';
import type { PageTemplateData } from 'types/ssr';

const placeholders: PageTemplateData = {
  titleTag: `<title>${config.brandName}</title>`,
};

export default placeholders;
