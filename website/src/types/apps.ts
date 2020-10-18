/**
 * The type for NUSMods apps from https://github.com/nusmodifications/nusmods-apps
 */
export type AppInfo = {
  name: string;
  description: string;
  author: string;
  url: string;
  repository_url?: string;
  icon_url: string;
  tags: string[];
};
