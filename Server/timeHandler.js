export const granToSeconds = {
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
  H2: 7200,
};

export async function compareTimes(timeEarly, timeLater, difference = 0) {
  //assuming the same day
  if (typeof timeEarly === "undefined") return true;

  const time1_seconds = new Date(timeEarly).getSeconds();
  const time2_seconds = new Date(timeLater).getSeconds();

  return time1_seconds + difference <= time2_seconds;
}
