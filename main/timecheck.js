let TimeCheck = ['00','05','10','15','20','25','30','35','40','45','50','55']
let count0 = 0
let count1 = 0
let count2 = 0
let count3 = 0
let count4 = 0
let count5 = 0
let count6 = 0
let count7 = 0
let count8 = 0
let count9 = 0
let count10 = 0
let count11 = 0

const check = (current_min) => {
  if(current_min == TimeCheck[0] && count0 != 1){
    count0++
    return count0
  }
  if(current_min == TimeCheck[1] && count1 != 1){
    count1++
    return count1
  }
  if(current_min == TimeCheck[2] && count2 != 1){
    count2++
    return count2
  }
  if(current_min == TimeCheck[3] && count3 != 1){
    count3++
    return count3

  }
  if(current_min == TimeCheck[4] && count4 != 1){
    count4++
    return count4
  }
  if(current_min == TimeCheck[5] && count5 != 1){
    count5++
    return count5
  }
  if(current_min == TimeCheck[6] && count6 != 1){
    count6++
    return count6
  }
  if(current_min == TimeCheck[7] && count7 != 1){
    count7++
    return count7
  }
  if(current_min == TimeCheck[8] && count8 != 1){
    count8++
    return count8
  }
  if(current_min == TimeCheck[9] && count9 != 1){
    count9++
    return count9
  }
  if(current_min == TimeCheck[10] && count10 != 1){
    count10++
    return count10
  }
  if(current_min == TimeCheck[11] && count11 != 1){
    count11++
    return count11
  }

  if(current_min != TimeCheck[0] && count0 == 1){
    count0++
  }
  if(current_min != TimeCheck[1] && count1 == 1){
    count1--
  }
  if(current_min != TimeCheck[2] && count2 == 1){
    count2--
  }
  if(current_min != TimeCheck[3] && count3 == 1){
    count3--
  }
  if(current_min != TimeCheck[4] && count4 == 1){
    count4--
  }
  if(current_min != TimeCheck[5] && count5 == 1){
    count5--
  }
  if(current_min != TimeCheck[6] && count6 == 1){
    count6--
  }
  if(current_min != TimeCheck[7] && count7 == 1){
    count7--
  
  }
  if(current_min != TimeCheck[8] && count8 == 1){
    count8--
  }
  if(current_min != TimeCheck[9] && count9 == 1){
    count9--
  }
  if(current_min != TimeCheck[10] && count10 == 1){
    count10--
  }
  if(current_min != TimeCheck[11] && count11 == 1){
    count11--
  }
}


module.exports = {check}