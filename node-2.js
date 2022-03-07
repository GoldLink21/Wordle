/*
An alternate version trying a different approach for running it
*/

const fs = require("fs");

/**@type {string[]} */
let words;
/**@type {string[]} */
let wordsOrigin;

/**@typedef {boolean} b */
/**@typedef {{a:b,b:b,c:b,d:b,e:b,f:b,g:b,h:b,i:b,j:b,k:b,l:b,m:b,n:b,o:b,p:b,q:b,r:b,s:b,t:b,u:b,v:b,w:b,x:b,y:b,z:b}} CharChoice */

/**@type {[CharChoice,CharChoice,CharChoice,CharChoice,CharChoice]} */
var possibleChoices = [undefined, undefined, undefined, undefined, undefined];
var possibleCounts = [26,26,26,26,26];
/**@type {string[]} */
var allowed = [];

/**@type {CharChoice} */
// @ts-ignore
var az = {};
for(let i=0;i<26;i++)
    az[String.fromCharCode('a'.charCodeAt(0) + i)] = true;

// @ts-ignore
possibleChoices = possibleChoices.map(()=>Object.create(az));

/**Abstracted away to allow checking without using the ui */
function resetVars(){
    words = wordsOrigin?.slice();
    allowed = [];
    // @ts-ignore
    possibleChoices.forEach(s=>{
        for(let key in s){
            s[key]=true;
        }
    });
    possibleCounts = [26,26,26,26,26];
}

function totalIncluded(index){
    return Object.values(possibleChoices[index]).reduce((acc,cur)=>cur?acc+1:acc,0);
}

/**Signifies that a character should not show up at all */
function none(char){
    for(let i=0;i<5;i++) if(possibleCounts[i] > 1)removeFrom(i, char)
}
/**Signifies a char will not show up in a single index */
function removeFrom(index, char){
    possibleChoices[index][char]=false;
    possibleCounts[index]--;
}
/**Signifies only one char should be at a certain index */
function only(index, char){
    for(let key in possibleChoices[index]){
        if(key != char){
            possibleChoices[index][key]=false;
            possibleCounts[index]--;
        }
    }
}
/**Signifies that a specific character must occur in the string */
function includes(index, str){
    allowed.push(str);
    removeFrom(index, str);
}

/**Prints out possible words */
function gw(){
    let reg = new RegExp(possibleChoices.map(e=>"["+Object.keys(e).filter(el=>e[el]).join("")+"]").join(""));
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
    wordsOrigin = text.split("\r\n");
    //Removes empty last word
    wordsOrigin.pop();
})()


/**Returns the number of possible words after checking guess against correct */
function check1(correct, guess){
    /*if(correct.length !== 5 || guess.length !== 5){
        console.warn("Use only 5 letter words in function check1")
        return;
    }*/
    for(let gi=0;gi<5;gi++){
        for(let ci=0;ci<5;ci++){
            if(guess[gi] == correct[ci]){
                if(gi == ci) {
                    only(gi,guess[gi]);
                } else {
                    includes(gi,guess[gi]);
                }
                break;
            }
            //Gone through all correct letters and was not included
            if(ci == 4){
                none(guess[gi]);
            }
        }
    }
    return gw().length;
}

function testAll(){
    let output = {}
    console.time("Total");
    for(let i=0;i<wordsOrigin.length;i++){
        console.time("-Word"+i);
        let corrWord = wordsOrigin[i];
        output[corrWord] = 0;
        for(let j=0;j<wordsOrigin.length;j++){
            resetVars();
            //console.log(`Comparing ${wordsOrigin[j]} against ${corrWord}`)
            output[corrWord] += check1(corrWord,wordsOrigin[j]);
        }
        console.timeEnd("-Word"+i);
        //console.log("Just finished "+ corrWord);
    }
    console.timeEnd("Total");
    return output;
}   
console.log(testAll())
//Avg 30-31 seconds per word