/**@returns {string?} */
function readTextFile(file)
{
    fetch(`./${file}`).then(content => {
        content.text().then(text =>{
            wordsOrigin = text.split("\n").filter(s=>s.length===5);
            words = text.split("\n").filter(s=>s.length===5)
        })
    });
}

const incrementSpeed = true;

/**@type {string[]} */
let words;
/**@type {string[]} */
let wordsOrigin;

//#region Controls
let keyup = true;
Array.from(document.getElementsByClassName("char"))
.forEach(el=>{
    /**@type {HTMLInputElement} */
    // @ts-ignore
    let el2 = el;
    el2.addEventListener("keydown",e=>{
        if(keyup){
            if(e.key == "Backspace"){
                let i = Number(el.id.charAt(1));
                // @ts-ignore
                el.value="";
                if(i != 1){
                    setTimeout(()=>{
                        console.log("BACK")
                        let prev = document.getElementById("t"+(i-1))
                        // @ts-ignore
                        prev.value = ""
                        prev.focus();
                        
                    },10)
                    keyup = false;
                }
                
            } else {
                if(/[A-z]/.test(e.key)) {
                    let i= Number(el.id.charAt(1))+1;
                    // @ts-ignore
                    document.getElementById("t"+(i-1)).value = e.key;
                    setTimeout(()=>{
                        document.getElementById("t"+i).focus()
                    },1)
            
                    keyup = false;
                } else {
                    setTimeout(()=>{
                        // @ts-ignore
                        document.getElementById("t"+(Number(el.id.charAt(1)))).value = "";

                    },1)
                }
            }
        } else {
            keyup = true;
        }
    })
    
    el.addEventListener("keyup",e=>{
        keyup = true;
    })
})
Array.from(document.getElementsByClassName("notInc"))
.forEach(e=>{
    /**@type {HTMLInputElement} */
    // @ts-ignore
    let e2 = e;
    e2.addEventListener("change",e1=>{
        document.getElementById("w"+e.id[1]).style.background="grey"
    })
})
Array.from(document.getElementsByClassName("inc"))
.forEach(e=>{
    /**@type {HTMLInputElement} */
    // @ts-ignore
    let e2 = e;
    e2.addEventListener("change",e1=>{
        document.getElementById("w"+e.id[1]).style.background="yellow"
    })
})
Array.from(document.getElementsByClassName("correct"))
.forEach(e=>{
    /**@type {HTMLInputElement} */
    // @ts-ignore
    let e2 = e;
    e2.addEventListener("change",e1=>{
        document.getElementById("w"+e.id[1]).style.background="green"
    })
})

//#endregion Controls

var word = {
    /**@type {HTMLInputElement[]} */
    //@ts-ignore
    elems:[
        document.getElementById("t1"),
        document.getElementById("t2"),
        document.getElementById("t3"),
        document.getElementById("t4"),
        document.getElementById("t5"),
    ],
    get [0](){ return this.elems[0].value},
    get [1](){ return this.elems[1].value},
    get [2](){ return this.elems[2].value},
    get [3](){ return this.elems[3].value},
    get [4](){ return this.elems[4].value},
    get all(){ return this[0]+this[1]+this[2]+this[3]+this[4]}
}

function gatherWord(){
    [
        document.getElementsByName("t1"),
        document.getElementsByName("t2"),
        document.getElementsByName("t3"),
        document.getElementsByName("t4"),
        document.getElementsByName("t5")
    ].forEach((elem,id)=>{
        // @ts-ignore
        if(elem[0].checked){
            //Not included
            none(word[id]);
        // @ts-ignore
        } else if(elem[1].checked){
            //Has but not correct
            includes(id,word[id]);
        // @ts-ignore
        } else if(elem[2].checked){
            //Correct place
            only(id, word[id]);
        } else {
            console.assert(false,"This should never happen");
        }
    })
    getRecommended(gw());
}

/**Gets at most n items from from */
function choose(n=50, from){
    n = Math.min(from.length, n);
    let chosen = {};
    for(let i=0;i<n;i++){
        let index = 0;
        do index = Math.floor(Math.random()*from.length);
        while(from[index] in chosen);
        chosen[from[index]]=index;
    }
    return Object.keys(chosen);
}

/**@type {[string[],string[],string[],string[],string[]]} */
var possibleChoices = [[],[],[],[],[]];
/**@type {string[]} */
var allowed = [];

var az = new Array(26);
for(let i=0;i<26;i++)
    az[i] = String.fromCharCode('a'.charCodeAt(0) + i);

/**Used for setting back up inital values and such*/
function reset(){
    [ document.getElementsByName("t1"), document.getElementsByName("t2"),
        document.getElementsByName("t3"), document.getElementsByName("t4"),
        document.getElementsByName("t5") 
    // @ts-ignore
    ].forEach(e=>{ e[0].checked = true })
    Array.from(document.getElementsByClassName("char"))
    // @ts-ignore    
        .forEach(e=>{ e.value = "" });
    document.getElementById("t1").focus()
    resetVars();
    // @ts-ignore
    Array.from(document.getElementsByClassName("wrapper")).forEach(e=>e.style.background='grey');
}

/**Abstracted away to allow checking without using the ui */
function resetVars(){
    words = wordsOrigin?.slice();
    allowed = [];
    possibleChoices = [[],[],[],[],[]];
    // @ts-ignore
    possibleChoices = possibleChoices.map(arr=>az.slice());
}

/**Signifies that a character should not show up at all */
function none(char){
    for(let i=0;i<5;i++) if(possibleChoices[i].length !== 1)removeFrom(i, char)
}
/**Signifies a char will not show up in a single index */
function removeFrom(index, char){
    possibleChoices[index] = possibleChoices[index].filter(e=>e!=char);
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

/** */
function getOnlyLetters(){
    /**@type {string[]} */
    let letters = [undefined,undefined,undefined,undefined,undefined];
    for(let i=0; i < possibleChoices.length; i++){
        if(possibleChoices[i].length == 1){
            letters[i] = possibleChoices[i][0];
        }
    }
    return letters;
}

/** */
function countLettersLeft(wordsSet){
    let counts = {};
    for(let i=0;i<wordsSet.length;i++){
        for(let j=0;j<wordsSet[i].length;j++){
            if(!(wordsSet[i][j] in counts)){
                counts[wordsSet[i][j]] = 1;
            } else {
                counts[wordsSet[i][j]]++;
            }
        }
    }
    return Object.entries(counts).sort((a,b)=>b[1] - a[1])
}

function getRecommended(wordsLeft){
    let output = document.getElementById("outputs");
    let onlys = getOnlyLetters().filter(e=>e!==undefined);
    if(onlys.length >=3 && false) {
        //We try to guess based on what is left
        let wordsOut = wordsOrigin.slice();
        let left = countLettersLeft(wordsLeft);
        for(let i=5;i>0;i--){

            wordsOut = wordsOrigin.filter(w=>new RegExp("[^"+onlys.join("")+"]"));
            let check = left.filter(l=>!onlys.includes(l[0])).slice(0,i);
            console.log(`check: ${check}`)
            for(let j=0;j<i;j++){
                wordsOut = wordsOut.filter(w=>new RegExp(check[0][i]).test(w))
            }
            if(wordsOut.length > 0){
                break;
            }
        }
        // taste | haste | waste  (watch)
        output.innerHTML = `<div>(${wordsLeft.length} total) !Suggested: <span>` + wordsOut.join("</span>&nbsp;&nbsp;<span>") + "</span></div>"
    } else {
        //Gives random words to guess if there are less than three words found out
        output.innerHTML = `<div>(${wordsLeft.length} total) Suggested: <span>` + choose(50, wordsLeft).join("</span>&nbsp;&nbsp;<span>") + "</span></div>"
    }
}

(function init(){
    reset();
    readTextFile("./words5.txt")
})()

/*Checking to find the best starting word */

/**@enum {number} */
const inclusion = {
    NOT_INCLUDED:0,
    INCLUDED:1,
    CORRECT:2
}

/**
 * 
 * @param {number} id index of the char to check 
 * @param {string} letter the char to check
 * @param {inclusion} inc How included it is
 */
function letterCheck(id, letter, inc){
    if(inc == inclusion.NOT_INCLUDED){
        //Not included
        none(letter);
    // @ts-ignore
    } else if(inc == inclusion.INCLUDED){
        //Has but not correct
        includes(id,letter);
    // @ts-ignore
    } else if(inc == inclusion.CORRECT){
        //Correct place
        only(id, letter);
    } else {
        console.assert(false,"This should never happen");
    }
}

/**Returns the number of possible words after checking guess against correct */
function check1(correct, guess){
    if(correct.length !== 5 || guess.length !== 5){
        console.warn("Use only 5 letter words in function check1")
        return;
    }
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
    for(let i=0;i<wordsOrigin.length;i++){
        output[wordsOrigin[i]] = 0;
        for(let j=0;j<wordsOrigin.length;j++){
            output[wordsOrigin[i]] += check1(wordsOrigin[i],wordsOrigin[j]);
        }
        //if(i % 10 == 0){
            console.log("Just finished "+ i);
        //}
    }
    return output;
}   
