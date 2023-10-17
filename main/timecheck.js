let TimeCheck = [
  "00",
  "02",
  "04",
  "06",
  "08",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "50",
  "52",
  "54",
  "56",
  "58",
];
let count0 = 0,
  count1 = 0,
  count2 = 0,
  count3 = 0,
  count4 = 0,
  count5 = 0,
  count6 = 0,
  count7 = 0,
  count8 = 0,
  count9 = 0,
  count10 = 0,
  count11 = 0,
  count12 = 0,
  count13 = 0,
  count14 = 0,
  count15 = 0,
  count16 = 0,
  count17 = 0,
  count18 = 0,
  count19 = 0,
  count20 = 0,
  count21 = 0,
  count22 = 0,
  count23 = 0,
  count24 = 0,
  count25 = 0,
  count26 = 0,
  count27 = 0,
  count28 = 0,
  count29 = 0;

const check = (current_min) => {
  console.clear()
  console.log('Current Time Checked')
  console.log('------------------------------------------------------------------------------------------')
  console.log(TimeCheck[0],TimeCheck[1],TimeCheck[2],TimeCheck[3],TimeCheck[4],TimeCheck[5],TimeCheck[6],TimeCheck[7],TimeCheck[8],TimeCheck[9],TimeCheck[10],TimeCheck[11],TimeCheck[12],TimeCheck[13],TimeCheck[14],TimeCheck[15],TimeCheck[16],TimeCheck[17],TimeCheck[18],TimeCheck[19],TimeCheck[20],TimeCheck[21],TimeCheck[22],TimeCheck[23],TimeCheck[24],TimeCheck[25],TimeCheck[26],TimeCheck[27],TimeCheck[28],TimeCheck[29])
  console.log(count0,'', count1,'',count2,'',count3,'',count4,'',count5,'',count6,'',count7,'',count8,'',count9,'',count10,'',count11,'',count12,'',count13,'',count14,'',count15,'',count16,'',count17,'',count18,'',count19,'',count20,'',count21,'',count22,'',count23,'',count24,'',count25,'',count26,'',count27,'',count28,'',count29)
  console.log('------------------------------------------------------------------------------------------')
  console.log(`CurrentMin: ${current_min}`)
  console.log('------------------------------------------------------------------------------------------')

  if (current_min == TimeCheck[0] && count0 != 1) {
    count0++;
    return count0;
  }
  if (current_min == TimeCheck[1] && count1 != 1) {
    count1++;
    return count1;
  }
  if (current_min == TimeCheck[2] && count2 != 1) {
    count2++;
    return count2;
  }
  if (current_min == TimeCheck[3] && count3 != 1) {
    count3++;
    return count3;
  }
  if (current_min == TimeCheck[4] && count4 != 1) {
    count4++;
    return count4;
  }
  if (current_min == TimeCheck[5] && count5 != 1) {
    count5++;
    return count5;
  }
  if (current_min == TimeCheck[6] && count6 != 1) {
    count6++;
    return count6;
  }
  if (current_min == TimeCheck[7] && count7 != 1) {
    count7++;
    return count7;
  }
  if (current_min == TimeCheck[8] && count8 != 1) {
    count8++;
    return count8;
  }
  if (current_min == TimeCheck[9] && count9 != 1) {
    count9++;
    return count9;
  }
  if (current_min == TimeCheck[10] && count10 != 1) {
    count10++;
    return count10;
  }
  if (current_min == TimeCheck[11] && count11 != 1) {
    count11++;
    return count11;
  }
  if (current_min == TimeCheck[12] && count12 != 1) {
    count12++;
    return count12;
  }
  if (current_min == TimeCheck[13] && count13 != 1) {
    count13++;
    return count13;
  }
  if (current_min == TimeCheck[14] && count14 != 1) {
    count14++;
    return count14;
  }
  if (current_min == TimeCheck[15] && count15 != 1) {
    count15++;
    return count15;
  }
  if (current_min == TimeCheck[16] && count16 != 1) {
    count16++;
    return count16;
  }
  if (current_min == TimeCheck[17] && count17 != 1) {
    count17++;
    return count17;
  }
  if (current_min == TimeCheck[18] && count18 != 1) {
    count18++;
    return count18;
  }
  if (current_min == TimeCheck[19] && count19 != 1) {
    count19++;
    return count19;
  }
  if (current_min == TimeCheck[20] && count20 != 1) {
    count20++;
    return count20;
  }
  if (current_min == TimeCheck[21] && count21 != 1) {
    count21++;
    return count21;
  }
  if (current_min == TimeCheck[22] && count22 != 1) {
    count22++;
    return count22;
  }
  if (current_min == TimeCheck[23] && count23 != 1) {
    count23++;
    return count23;
  }
  if (current_min == TimeCheck[24] && count24 != 1) {
    count24++;
    return count24;
  }
  if (current_min == TimeCheck[25] && count25 != 1) {
    count25++;
    return count25;
  }
  if (current_min == TimeCheck[26] && count26 != 1) {
    count26++;
    return count26;
  }
  if (current_min == TimeCheck[27] && count27 != 1) {
    count27++;
    return count27;
  }
  if (current_min == TimeCheck[28] && count28 != 1) {
    count28++;
    return count28;
  }
  if (current_min == TimeCheck[29] && count29 != 1) {
    count29++;
    return count29;
  }

  if (current_min != TimeCheck[0] && count0 == 1) {
    count0--;
  }
  if (current_min != TimeCheck[1] && count1 == 1) {
    count1--;
  }
  if (current_min != TimeCheck[2] && count2 == 1) {
    count2--;
  }
  if (current_min != TimeCheck[3] && count3 == 1) {
    count3--;
  }
  if (current_min != TimeCheck[4] && count4 == 1) {
    count4--;
  }
  if (current_min != TimeCheck[5] && count5 == 1) {
    count5--;
  }
  if (current_min != TimeCheck[6] && count6 == 1) {
    count6--;
  }
  if (current_min != TimeCheck[7] && count7 == 1) {
    count7--;
  }
  if (current_min != TimeCheck[8] && count8 == 1) {
    count8--;
  }
  if (current_min != TimeCheck[9] && count9 == 1) {
    count9--;
  }
  if (current_min != TimeCheck[10] && count10 == 1) {
    count10--;
  }
  if (current_min != TimeCheck[11] && count11 == 1) {
    count11--;
  }
  if (current_min != TimeCheck[12] && count12 == 1) {
    count12--;
  }
  if (current_min != TimeCheck[13] && count13 == 1) {
    count13--;
  }
  if (current_min != TimeCheck[14] && count14 == 1) {
    count14--;
  }
  if (current_min != TimeCheck[15] && count15 == 1) {
    count15--;
  }
  if (current_min != TimeCheck[16] && count16 == 1) {
    count16--;
  }
  if (current_min != TimeCheck[17] && count17 == 1) {
    count17--;
  }
  if (current_min != TimeCheck[18] && count18 == 1) {
    count18--;
  }
  if (current_min != TimeCheck[19] && count19 == 1) {
    count19--;
  }
  if (current_min != TimeCheck[20] && count20 == 1) {
    count20--;
  }
  if (current_min != TimeCheck[21] && count21 == 1) {
    count21--;
  }
  if (current_min != TimeCheck[22] && count22 == 1) {
    count22--;
  }
  if (current_min != TimeCheck[23] && count23 == 1) {
    count23--;
  }
  if (current_min != TimeCheck[24] && count24 == 1) {
    count24--;
  }
  if (current_min != TimeCheck[25] && count25 == 1) {
    count25--;
  }
  if (current_min != TimeCheck[26] && count26 == 1) {
    count26--;
  }
  if (current_min != TimeCheck[27] && count27 == 1) {
    count27--;
  }
  if (current_min != TimeCheck[28] && count28 == 1) {
    count28--;
  }
  if (current_min != TimeCheck[29] && count29 == 1) {
    count29--;
  }
  return 0
};

module.exports = { check };
