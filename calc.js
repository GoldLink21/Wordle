const { argv, exit } = require("process");

const perSec = 1/45;
const perMin = perSec*60;
const perHour = perMin*60;
const perDay = perHour*24;

let t = argv[2]
let regex = /^\d+\.?\d*[mhsd]$/
if(!regex.test(t)){
    console.error("Please use the format #*[.#*]t\n\twith t as s for seconds, m for minutes, h for hours, or d for day")
    exit(1);
}
let time = t.slice(0,t.length-1);
switch(t[t.length-1]){
    case "s":
        console.log(`${time*perSec} words`)
        break;
    case "m":
        console.log(`${time*perMin} words`)
        break
    case "h":
        console.log(`${time*perHour} words`)
        break;
    case "d":
        console.log(`${time*perDay} words`)
        break;
}