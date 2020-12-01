const granToSeconds = {
  S5: 5,
  S10: 10,
  S15: 15,
  S30: 30,
  M1: 60,
  M2: 120,
  M4: 240,
  M5: 300,
  M10: 600,
  M15: 900,
  M30: 1800,
  H1: 3600,
  H4: 14400,
  D: 14400 * 6,
};

function compareTimes(timeEarly, timeLater, difference = 0) {
  //difference in seconds
  if (typeof timeEarly === "undefined") return true;

  const time1 = new Date(timeEarly);
  const time2 = new Date(timeLater);

  return difference * 1000 <= time2 - time1;
}

module.exports = {
  granToSeconds: granToSeconds,
  compareTimes: compareTimes,
};
