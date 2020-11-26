const SMA = require("technicalindicators").SMA;
let period = 30;
let values = [
  1.19149,
  1.19149,
  1.19152,
  1.19149,
  1.19152,
  1.19149,
  1.19153,
  1.19154,
  1.19156,
  1.19154,
  1.19152,
  1.19154,
  1.19153,
  1.19154,
  1.19159,
  1.19158,
  1.19158,
  1.19155,
  1.19154,
  1.19154,
  1.19155,
  1.19155,
  1.19159,
  1.19154,
  1.19157,
  1.19151,
  1.19152,
  1.19154,
  1.19154,
  1.19151,
  1.1915,
  1.19152,
  1.19151,
  1.19153,
  1.19155,
  1.19156,
  1.19158,
  1.19154,
  1.19154,
  1.19157,
  1.19159,
  1.19157,
  1.19159,
  1.19158,
  1.19154,
  1.19157,
  1.19155,
  1.19157,
  1.19155,
  1.19157,
  1.19159,
  1.19157,
  1.19158,
  1.19163,
  1.19161,
  1.19162,
  1.19162,
  1.19162,
  1.19162,
  1.19163,
  1.19162,
  1.19158,
  1.19157,
  1.19156,
  1.19157,
  1.19158,
  1.19153,
  1.19151,
  1.19152,
  1.19152,
  1.19152,
  1.19152,
  1.19152,
  1.19152,
  1.19151,
  1.19154,
  1.19158,
  1.19159,
  1.1916,
  1.1916,
  1.19158,
  1.19161,
  1.19158,
  1.19159,
  1.1916,
  1.19159,
  1.19155,
  1.19154,
  1.19157,
  1.19158,
  1.19157,
  1.19155,
  1.19152,
  1.19148,
  1.19145,
  1.19143,
  1.19143,
  1.19145,
  1.19145,
  1.1915,
];

let a = SMA.calculate({ period: period, values: values });
console.log(a[70]);
