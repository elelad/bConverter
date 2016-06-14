/**
 * Created by Elad on 01/04/2016.
 */

//------------Rates-------------------------------
const flourCupToGramRate = 140;
const whiteSugarCupToGramRate = 200;


//----------------Const Ingredients---------------------------
const FLOUR = "Flour";
const COCOA = "Cocoa";
const CORNFLOUR = "Cornflour";
const WHITESUGAR = "White Sugar";

//------------------Const-------------------------------------
const CUP = "cup";
const SPOON = "spoon";
const TEASPOON = "teaspoon";
const GRAM = "gram";
const ML = "ml";

class Ingredient {
    constructor(name, cupToGram, spoonToGram, teaspoonToGram) {
        this.name = name;
        this.cupToGram = cupToGram;
        this.spoonToGram = spoonToGram;
        this.teaspoonToGram = teaspoonToGram;
        this.gramToCup = 1 / this.cupToGram;
        this.gramToSpoon = 1 / this.spoonToGram;
        this.gramToTeaspoon = 1 / this.teaspoonToGram;
    }
}

var iFlour = new Ingredient("Flour", 140, 10, -1);
var iCocoa = new Ingredient("Cocoa", 140, 10, -1);
var iCornflour = new Ingredient("Cornflour", 140, 10, -1);
var iSalt = new Ingredient("Salt", -1, 15, 5);
var iWhiteSugar = new Ingredient("WhiteSugar", 200, 12, 4);
var iBrownSugar = new Ingredient("BrownSugar", 240, 15, 5);
var iSugarPowder = new Ingredient("SugarPowder", 120, 8, 3);
var iHoney = new Ingredient("Hone", 320, 20, 7);
var iButter = new Ingredient("Butter", 240, 15, -1);
var iAlmonds = new Ingredient("Almonds", 100, -1, -1);
var iNuts = new Ingredient("Nuts", 100, -1, -1);
var iOats = new Ingredient("Oats", 100, -1, -1);
var iCoconut = new Ingredient("Coconut", 100, -1, -1);
var iDriedFruit = new Ingredient("DriedFruit", 100, -1, -1);
var iBakingPowder = new Ingredient("BakingPowder", -1, 10, 3);
var iBakingSoda = new Ingredient("BakingSoda", -1, 10, 3);

var aIngredients = [iFlour, iCocoa, iCornflour, iSalt, iWhiteSugar, iBrownSugar, iSugarPowder, iHoney, iButter, iAlmonds,
    iNuts, iOats , iCoconut, iDriedFruit, iBakingPowder, iBakingSoda];

function calculateRate() {
    var num = document.getElementById("number").value; //get how many cups/spoons to covert from user
    var ingredient = document.getElementById("ingredient").value; // get the ingredient from user
    ingredient = ingredient.replace(" ", ""); //remove unnecessary blanks
    var index = findIndexInArray(ingredient);  //aIngredients.indexOf(ingredient); //find the index of the ingredient in all ingredients array
    var rateString = document.getElementById("from").value.toLowerCase() + "To" + document.getElementById("to").value; //find from to from user
    rateString = rateString.replace(" ", ""); //remove unnecessary blanks
    var rate = -1;
    if (!(index < 0)) {
        rate = aIngredients[index][rateString]; //find the rate for the ingredient and the from to
    }
    if (rate <= 0 || rate == undefined) { //if no rate
        document.getElementById("result").innerHTML = "cant calculate";
    } else { //if there is rate
        if (num == 1){
        document.getElementById("result").innerHTML = num + " " + document.getElementById("from").value +
            " of " +  ingredient + " = " +
            Math.round ((num * rate)*10) / 10 + " " + document.getElementById("to").value.toLowerCase();
        }else {
            document.getElementById("result").innerHTML = num + " " + document.getElementById("from").value +
                "'s of " +  ingredient + " = " +
                Math.round ((num * rate)*10) / 10 + " " + document.getElementById("to").value.toLowerCase();
        }
    }
}

function findIndexInArray(searchFor) { //find the index of ingredient
    for (var i = 0; i < aIngredients.length; i++) {
        if (aIngredients[i].name == searchFor) {
            return i;
        }
    }
    return -1;
}

/*
//print the result to result html element
function showResult(num, rate) {
    if (rate <= 0 || rate == undefined) {
        document.getElementById("result").innerHTML = "cant calculate";
    } else {
        document.getElementById("result").innerHTML = (num * rate).toString();
    }
}

*/

/*
 function flourGramToCup() {
 var num = document.getElementById("number").value;
 document.getElementById("result").innerHTML = (num * 1/ flourCupToGramRate).toString();
 }*/


/*
 function calculateRate() {
 var ingredient = document.getElementById("ingredient").value;
 var from = document.getElementById("from").value;
 var to = document.getElementById("to").value;
 var num = document.getElementById("number").value;
 //noinspection JSAnnotator
 var rate = 0;
 if ((from == GRAM) && (to == CUP)){
 rate = 1/flourCupToGramRate;
 }
 if ((from == CUP) && (to == GRAM)){
 rate = flourCupToGramRate;
 }
 showResult(num, rate);
 }
 */


