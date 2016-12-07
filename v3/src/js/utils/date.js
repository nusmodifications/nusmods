// @flow
export function dateForDisplay(date: String): string {
  // example dateTime from NUSMods API "2016-11-23T09:00+0800"
  // remove the T and strip the timezone at the end
  return date.replace('T', ' ').slice(0, -5);
}

export function dummy() {}
