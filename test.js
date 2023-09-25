const date = require('date-and-time')
let TimeCheck = ['00','05','10','19','20','25','30','35','40','45','50','55']
console.log('hello world')

const delayExecution = (ms) => {
  return new Promise((resolve, reject) => {
            setTimeout(() => {
          resolve()
      }, ms)
  })
}


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

const loop = async () => {
  console.log(TimeCheck)
    while (true) {
      delayExecution(10000)
      let current_min = date.format(new Date, 'mm')
      
      
        if(current_min == TimeCheck[0] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[1] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[2] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[3] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[4] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[5] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[6] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[7] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[8] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[9] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[10] && count0 != 1){
          count0++
          console.log(current_min)
        }
        if(current_min == TimeCheck[11] && count0 != 1){
          count0++
          console.log(current_min)
        }
    }
}
loop()