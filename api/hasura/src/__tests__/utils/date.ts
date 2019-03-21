function toEpoch(time: string) {
  return new Date(time).getTime();
}

export default {
  toEpoch,
};
