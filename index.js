#!/usr/bin/env node
'use strict';
const program = require('commander');
const prompt = require('prompt');

let wordCompare = (curWord, targetWord, list) => {
  var aNewList = [];
  var successful = false;
  var curWordSplit = curWord.split("");
  var targetWordSplit = targetWord.split("");
  for(let a=0;a<list.length;a++){
    var comperable=0;
    var unshift = false;
    var findMatch = 0;
    var foundMatch = false;
    var listWordSplit = list[a].split("");
    for(let b=0;b<curWord.length;b++){
      if(curWordSplit[b] === listWordSplit[b]){
        comperable++;
      }else if (targetWordSplit[b]===listWordSplit[b]) {
        unshift = true;
      }
      if (targetWord[b]===listWordSplit[b]) {
        findMatch++;
      }
      if(comperable == curWord.length - 1){
        if(findMatch == curWord.length){
          aNewList.unshift(list[a])
          foundMatch = true;
          a == list.length;
          return {
            foundMatch: foundMatch,
            aNewList: aNewList
          };
        }
        if(unshift === true){
          aNewList.unshift(list[a])
        }else{
          aNewList.push(list[a])
        }
      }
    }
  }
  return {
    foundMatch: foundMatch,
    aNewList: aNewList
  };
};

let connectFunction = (first) => {
  var wordlength = first.length;
  let currentword = first;
  let currentChain = [];
  let elegablelist = [];
  elegablelist[0] = [];
  const fs = require('fs');
  let getlist = fs.readFileSync('wordlist.txt', 'utf-8');
  let wordlist = getlist.replace(/'/g,'').split("\r\n");
  wordlist.map(function(a){
    if(a.length === wordlength && a !== first){ //create master list of available words to choose from
      elegablelist[0].push(a);
    }
  });
  var refinedList = elegablelist[0]; //words available for searching continually updated to not include the current found words
  let secondword = "";
  var letterGap = 2;

  prompt.start();
  prompt.get([{name:'secondword', description:'Enter second word'}], function(err, result){
    if(err){return console.log(err);}
    if(first === result.secondword){
      return console.log("Choose two different words next time...")
    }
    if(first.length !== result.secondword.length){
      return console.log("Please choose two words of equal length...")
    }
    secondword = result.secondword;
    let foundWords={}

    //as long as searching for word chains
    for(let c=0, f=0;letterGap > 1;){
      //initial submit of words and list
      let foundWords = wordCompare(currentword, secondword, elegablelist[c]);

      //if the elegable words found includes the target word
      while(foundWords.foundMatch === false){
        //console.log("fired");
        //console.log(foundWords.aNewList);
        if(foundWords.aNewList.length > 0){ //if no new words are returned then a dead end was reached
          f=0;
          c++;
          elegablelist[c] = foundWords.aNewList; //elegablelist also contains a history of words in case current chain doesn't connect
        }else{
          if(f+1 >= elegablelist[c].length){
            c--; //go to the previous list of possible words since the current one dead ended
            elegablelist[c].splice(0,1); //remove the first item of the list since it dead ended
            while(elegablelist[c].length === 0){
              c--;
              elegablelist[c].splice(0,1); //remove the first item of the list since it dead ended
            }
            if(elegablelist[0].length === 0){
              return console.log("A chain could not be achieved, please try different words...")
            }
            f=0; //reset to first off array (since the first one that failed has been removed)
          }else{
            f++;
          }
        }
        currentword = elegablelist[c][f];
        //subtract found words from available words
        for(let d=0;d < refinedList.length;d++){
          if(elegablelist[c].includes(refinedList[d])){
            refinedList.splice(d,1);
          }
        }
        foundWords = wordCompare(currentword, secondword, refinedList);
      }
      c++;
      elegablelist[c] = foundWords.aNewList; //elegablelist also contains a history of words in case current chain doesn't connect
      console.log(first);
      for(var e=1;e<elegablelist.length;e++){
        console.log(elegablelist[e][0])
      }
      letterGap = 1;
    }
  });
}

program
  .version('0.0.1')
  .command('first [first]')
  .description('Connect Words!')
  .action(connectFunction);
program.parse(process.argv);
