/**
 * Created by Elad on 10/06/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//--------------Const Var's-----------------------------
var AllIng = (function () {
    function AllIng() {
        this.aIngredients = []; //array for all ingredients for a kind
    }
    AllIng.prototype.pushIngredient = function (ing) {
        this.aIngredients.push(ing);
    }; //method to push ingredient to array
    AllIng.prototype.printIngArray = function () {
        for (var i = 0; i < this.aIngredients.length; i++) {
            console.log(this.aIngredients[i].print());
        }
    };
    AllIng.prototype.getIngredients = function () {
        return this.aIngredients;
    };
    return AllIng;
}());
var CN = (function () {
    function CN() {
    }
    CN.getData = function (className) {
        switch (className) {
            case "GramIng":
                CN.allIng = new AllIng();
                break;
            case "MlIng":
                CN.allIng = new AllIng();
                break;
            case ("Temperature"):
                CN.allIng = new AllIng();
                break;
        }
        CN.ingRequest.abort();
        CN.ingRequest.open("GET", "../data/data.json", true);
        CN.ingRequest.onreadystatechange = function () {
            if (CN.ingRequest.readyState == 4 && CN.ingRequest.status == 200) {
                var tempResponse = CN.ingRequest.responseText; //get response
                //console.log(JSON.parse(tempResponse));
                var obResponse = JSON.parse(tempResponse); //parse response
                switch (className) {
                    case "GramIng":
                        for (var i = 0; i < obResponse.gram.length; i++) {
                            CN.allIng.pushIngredient(new GramIng(obResponse.gram[i].iName, obResponse.gram[i].iCup, obResponse.gram[i].iSpoon, obResponse.gram[i].iTeaspoon));
                        }
                        break;
                    case ("MlIng"):
                        CN.allIng.pushIngredient(new MlIng(obResponse.ml[0].iName, obResponse.ml[0].iCup, obResponse.ml[0].iSpoon, obResponse.ml[0].iTeaspoon));
                        break;
                    case ("Temperature"):
                        for (var i = 0; i < obResponse.temperature.length; i++) {
                            CN.allIng.pushIngredient(new Temperature(obResponse.temperature[i].iName));
                        }
                }
                CN.allIng.printIngArray();
                CN.putDataInSelectList(); // put ingredients names in the select list
            }
        };
        this.ingRequest.send(null);
    }; //method to get data from server and put it in the ingredients array
    CN.putDataInSelectList = function () {
        for (var i = 0; i < CN.allIng.getIngredients().length; i++) {
            var opt = document.createElement("option"); //create option
            opt.value = i.toString(); // put value in option
            opt.text = CN.allIng.getIngredients()[i].ingName(); // put text in option
            var select = document.getElementById("ingList");
            select.appendChild(opt); //put option in the list
        }
    }; // method to put options in select ingredients html list
    CN.calConvert = function () {
        var measureInput = document.getElementById("measure");
        var measure = parseInt(measureInput.value); // get grams from user
        var measureName = document.getElementById("measureLabel").innerHTML; //get measure label (garm or ml)
        console.log(measureName);
        var toolSelect = document.getElementById("toList");
        var tool = toolSelect.value; //get tool from user
        var ingSelect = document.getElementById("ingList");
        var ingNumber = parseInt(ingSelect.value); //get ingredient from user
        console.log("measure: " + measure + " tool:" + tool);
        var result = CN.allIng.getIngredients()[ingNumber].convertResult(measure, tool);
        if (result < 0) {
            document.getElementById("result").innerHTML = "are you nuts?? " + measure + " " + measureName + " of " + CN.allIng.getIngredients()[ingNumber].ingName() + "??";
        }
        else {
            document.getElementById("result").innerHTML = measure + " " + measureName + " is " + CN.allIng.getIngredients()[ingNumber].convertResult(measure, tool) + " " + tool; // display result
        }
    }; // method to calculate convert result and show it to the user - for gram and ml only
    CN.tempConvert = function () {
        var degreeInput = document.getElementById("measure");
        var degree = parseInt(degreeInput.value); // get degree from user
        var scaleSelect = document.getElementById("ingList");
        var scaleNumber = parseInt(scaleSelect.value); //get scale number from user
        console.log("measure: " + degree);
        var result = CN.allIng.getIngredients()[scaleNumber].convertResult(degree, null);
        switch (CN.allIng.getIngredients()[scaleNumber].ingName()) {
            case "Fahrenheit":
                document.getElementById("result").innerHTML = degree + "&#176 Fahrenheit is " + result + "&#176 Celsius";
                break;
            case "Celsius":
                document.getElementById("result").innerHTML = degree + "&#176 Celsius is " + result + "&#176 Fahrenheit";
                break;
        }
    }; // method to calculate convert result and show it to the user - for temperature only
    CN.toggleCeFa = function () {
        var selected = document.getElementById("ingList");
        var selectedStr = selected.value;
        switch (selectedStr) {
            case "0":
                document.getElementById("to").innerHTML = "Celsius";
                break;
            case "1":
                document.getElementById("to").innerHTML = "Fahrenheit";
                break;
        }
    };
    CN.ingRequest = new XMLHttpRequest(); //xhr to get ingredient from server
    return CN;
}()); // class for const variables and methods
//------------Classes-----------------------------------
var Ing = (function () {
    function Ing(iName) {
        this.iName = iName;
    }
    Ing.prototype.ingName = function () {
        return this.iName;
    };
    Ing.prototype.print = function () {
        return this.iName;
    };
    Ing.prototype.convertResult = function (grams, tool) {
        return -1;
    };
    return Ing;
}()); // class for one ingredient
var GramIng = (function (_super) {
    __extends(GramIng, _super);
    function GramIng(iName, iCupToGram, iSpoonToGram, iTeaspoonToGram) {
        _super.call(this, iName);
        this.iCupToGram = iCupToGram;
        this.iSpoonToGram = iSpoonToGram;
        this.iTeaspoonToGram = iTeaspoonToGram;
        this.iGramToCup = 1 / this.iCupToGram;
        this.iGramToSpoon = 1 / this.iSpoonToGram;
        this.iGramToTeaspoon = 1 / this.iTeaspoonToGram;
    }
    GramIng.prototype.print = function () {
        return _super.prototype.print.call(this) + " CupToGram:" + this.iCupToGram + " SpoonToGram:" + this.iSpoonToGram + " TeaspoonToGram:" + this.iTeaspoonToGram;
    };
    //@Override
    GramIng.prototype.convertResult = function (grams, tool) {
        var result;
        switch (tool) {
            case "Cup":
                result = grams * this.iGramToCup;
                break;
            case "Spoon":
                result = grams * this.iGramToSpoon;
                break;
            case "Teaspoon":
                result = grams * this.iGramToTeaspoon;
                break;
        }
        return (result > 0) ? Math.round((result) * 10) / 10 : -1; //if no data to convert return -1
    };
    GramIng.className = "GramIng";
    return GramIng;
}(Ing)); // class for gram convert ingredient
var MlIng = (function (_super) {
    __extends(MlIng, _super);
    function MlIng(iName, iCupToMl, iSpoonToMl, iTeaspoonToMl) {
        _super.call(this, iName);
        this.iCupToMl = iCupToMl;
        this.iSpoonToMl = iSpoonToMl;
        this.iTeaspoonToMl = iTeaspoonToMl;
        this.iMlToCup = 1 / this.iCupToMl;
        this.iMlToSpoon = 1 / this.iSpoonToMl;
        this.iMlToTeaspoon = 1 / this.iTeaspoonToMl;
    }
    MlIng.prototype.print = function () {
        return _super.prototype.print.call(this) + " CupToMl:" + this.iCupToMl + " SpoonToMl:" + this.iSpoonToMl + " TeaspoonToMl:" + this.iTeaspoonToMl;
    };
    //@Override
    MlIng.prototype.convertResult = function (grams, tool) {
        var result;
        switch (tool) {
            case "Cup":
                result = grams * this.iMlToCup;
                break;
            case "Spoon":
                result = grams * this.iMlToSpoon;
                break;
            case "Teaspoon":
                result = grams * this.iMlToTeaspoon;
                break;
        }
        return (result > 0) ? Math.round((result) * 10) / 10 : -1; //if no data to convert return -1
    };
    MlIng.className = "MlIng";
    return MlIng;
}(Ing)); // class for gram convert ingredient
var Temperature = (function (_super) {
    __extends(Temperature, _super);
    function Temperature(iName) {
        _super.call(this, iName);
    }
    Temperature.prototype.convertResult = function (degree, scale) {
        var result = 0;
        switch (this.ingName()) {
            case "Fahrenheit":
                result = Math.round((degree - 32) / 1.8);
                break;
            case "Celsius":
                result = Math.round((degree * 1.8) + 32);
                break;
        }
        return result;
    };
    return Temperature;
}(Ing));
/*CN.pushIngredient(new GramIng("bf", 100, 1, 2));
 CN.printIngArray();*/
//CN.getData();
//------------------------------------------------------
//# sourceMappingURL=bConverter.js.map