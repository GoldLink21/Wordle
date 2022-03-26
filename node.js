/*
This is a node version for running in the console.
I mainly made it to try and calculate the best possible starting word
with a brute force approach
*/
const fs = require("fs");
const { argv } = require("process");

/**@type {string[]} */
let words;
/**@type {string[]} */
let wordsOrigin;

let progress;
let startIndex;
let endIndex;

/**@type {[string[],string[],string[],string[],string[]]} */
var possibleChoices = [[],[],[],[],[]];
/**@type {string[]} */
var allowed = [];

/**@type {string[]} */
var az = new Array(26);
for(let i=0;i<26;i++)
    az[i] = String.fromCharCode('a'.charCodeAt(0) + i);

/**Abstracted away to allow checking without using the ui */
function resetVars(){
    allowed = [];
    // @ts-ignore
    possibleChoices = [[],[],[],[],[]].map(()=>az.slice());
    //possibleChoices = [az.slice(),az.slice(),az.slice(),az.slice(),az.slice()];
}

/**Signifies that a character should not show up at all */
function none(char){
    for(let i=0;i<5;i++) if(possibleChoices[i].length !== 1)removeFrom(i, char)
}
/**Signifies a char will not show up in a single index */
function removeFrom(index, char){
    //possibleChoices[index] = possibleChoices[index].filter(e=>e!=char);
    for(let i=0;i<possibleChoices[index].length;i++){
        if(possibleChoices[index][i] == char){
            possibleChoices[index].splice(i,1);
            return;
        }
    }
}
/**Signifies only one char should be at a certain index */
function only(index, char){
    possibleChoices[index] = [char];
}
/**Signifies that a specific character must occur in the string */
function includes(index, str){
    allowed.push(str);
    removeFrom(index, str);
}

/**Prints out possible words */
function gw(){
    let reg = new RegExp(possibleChoices.map(e=>"["+e.join("")+"]").join(""));
    let out = wordsOrigin
        //Get ones that include all the required ones
        .filter(w=>reg.test(w))
        //Must include ALL the allowed chars
        .filter((/** @type {string} */ w)=>allowed.every(e=>w.includes(e)))
    return out;
    
}


(function init(){
    resetVars();
    let text = fs.readFileSync("./words5.txt").toString();
    wordsOrigin = text.split("\n");
    //console.log(wordsOrigin);
    //Removes empty last word
    wordsOrigin.pop();
    //Gets current progress
    progress = JSON.parse(fs.readFileSync("out.json"));
    startIndex = Object.keys(progress).length;
    console.log(argv[2]);
    if(argv[2]){
        endIndex = startIndex + Number(argv[2])
    } else {
        //Auto does a ~9 hour session
        endIndex = startIndex + 650;
    }
    if(endIndex > wordsOrigin.length){
        console.log("Overshooting");
        endIndex = wordsOrigin.length;
    }
})()
/*
//Hanlde interrupt
process.on("SIGINT", ()=>{
    saveProgress();
    console.log("Caught SIGINT, exiting now")
    process.exit(0);
})*/

/**
 * Returns the number of possible words after checking guess against correct 
 * @param {string} correct
 * @param {string} guess
 */
function check1(correct, guess){
    /*
    if(correct.length !== 5 || guess.length !== 5){
        console.warn("Use only 5 letter words in function check1")
        return;
    }*/
    for(let gi=0;gi<5;gi++){
        switch(correct.indexOf(guess[gi])){
            case gi:
                only(gi,guess[gi]);
                break;
            case -1:
                none(guess[gi]);
                break;
            default:
                includes(gi,guess[gi]);
        }
    }
    return gw().length;
}

function testAll(){
    let output = progress;
    console.time("Total");
    console.log(`Start:${startIndex}, End:${endIndex}`);
    for(let i=startIndex;i<endIndex;i++){
        console.time("-Word"+i);
        let corrWord = wordsOrigin[i];
        output[corrWord] = 0;
        let count = 0;
        for(let j=0;j<wordsOrigin.length;j++){
            resetVars();
            //console.log(`Comparing ${wordsOrigin[j]} against ${corrWord}`)
            count += check1(corrWord,wordsOrigin[j]);
        }
        output[corrWord] = count;
        console.timeEnd("-Word"+i);
        //Save roughly every half hour
        if(i % 40 == 0){
            saveProgress()
        }
    }
    console.timeEnd("Total");
    saveProgress();
    return output;
} 
function saveProgress() {
    console.log(`Saving progress to out.json\nCurrently at ${Object.keys(progress).length} words`);
    fs.writeFileSync("out.json", JSON.stringify(progress));
}

(function run() {
    let out = testAll();
    fs.writeFileSync("out.json",JSON.stringify(out));
})()

//Currently around 27-28 seconds per word on my machine