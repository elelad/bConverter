/// <reference path="../lib/jquery.d.ts" />


//--------------Const Var's-----------------------------

window.addEventListener("load", function() { window. scrollTo(0, 0); });
    
class AllIng<T extends Ing> {
    private aIngredients:T[] = []; //array for all ingredients for a kind
    pushIngredient(ing:T):void {
        this.aIngredients.push(ing);
    }//method to push ingredient to array
    printIngArray():void {
        for (let i:number = 0; i < this.aIngredients.length; i++) {
            console.log(this.aIngredients[i].print());
        }
    }

    getIngredients():T[] {
        return this.aIngredients;
    }
} //generic class for array for ingredient for all child's of Ing 
class CN {
    private static ingRequest:XMLHttpRequest = new XMLHttpRequest(); //xhr to get ingredient from server
    
    private static allIng; //initialize new array for ingredients

    static getData(className):void {
        switch (className) { 
            case ("GramIng"):
                CN.allIng = new AllIng<GramIng>();
                break;
            case ("MlIng"):
                CN.allIng = new AllIng<MlIng>();
                console.log("elad");
                break;
            case ("Temperature"):
                CN.allIng = new AllIng<Temperature>();
                break;
        }
        CN.ingRequest.abort();
        CN.ingRequest.open("GET", "../data/data.json", true);
        CN.ingRequest.onreadystatechange = function () {
            if (CN.ingRequest.readyState == 4 && CN.ingRequest.status == 200) {
                let tempResponse:string = CN.ingRequest.responseText; //get response
                //console.log(JSON.parse(tempResponse));
                let obResponse:Data = JSON.parse(tempResponse); //parse response
                switch (className) {
                    case "GramIng":
                        for (let i:number = 0; i < obResponse.gram.length; i++) { // put data in array
                            CN.allIng.pushIngredient(new GramIng(obResponse.gram[i].iName, obResponse.gram[i].iCup, obResponse.gram[i].iSpoon, obResponse.gram[i].iTeaspoon));
                        }
                        break;
                    case ("MlIng"):
                        CN.allIng.pushIngredient(new MlIng(obResponse.ml[0].iName, obResponse.ml[0].iCup, obResponse.ml[0].iSpoon, obResponse.ml[0].iTeaspoon));
                        break;
                    case ("Temperature"):
                        for (let i:number = 0; i < obResponse.temperature.length; i++) { // put data in array
                            CN.allIng.pushIngredient(new Temperature(obResponse.temperature[i].iName));
                        }
                }
                CN.allIng.printIngArray();
                CN.putDataInSelectList(className);// put ingredients names in the select list
            }

        };
        this.ingRequest.send(null);
    } //generic method to get data from server and put it in the ingredients array

    static getAllIng(){
        return this.allIng;
    } //get private allAll
    
    static putDataInSelectList(className:string):void {
        var listId:string = "";
        switch (className){
            case "GramIng":
                listId = "gIngList";
                break;
            case "MlIng":
                listId = "mIngList";
                break;
            case "Temperature":
                listId = "tIngList";
                break;
        }
        var select:HTMLSelectElement = <HTMLSelectElement>document.getElementById(listId);
        select.length = 0;
        for (let i:number = 0; i < CN.allIng.getIngredients().length; i++) {
            let opt = document.createElement("option"); //create option
            opt.value = i.toString(); // put value in option
            opt.text = CN.allIng.getIngredients()[i].ingName(); // put text in option
            if (i==0){
                opt.setAttribute("selected", "selected");
            }
            select.appendChild(opt); //put option in the list
        }
        select.value = "0";

    } // method to put options in select ingredients html list

    static validateInputNum(element:HTMLInputElement):boolean{
        var measure:number = parseInt(element.value);
        var rgx:RegExp = /\d/;
        console.log("is:" + rgx.test(measure.toString()));
        var eId:string = element.id[0];
        console.log("id[0]:" + eId);
        if (rgx.test(measure.toString()) && measure != 0){
            switch (eId){
                case "g":
                    GramIng.gramResultToScreen();
                    break;
                case "m":
                    MlIng.mlResultToScreen();
                    break;
                case "t":
                    Temperature.temperatureResultToScreen();
                    break;
            }
            return true;
        }else {
            console.log("pls enter a number");
            var a =  element.parentElement;//document.getElementById("gMeasure").parentElement;
            //a.style.border = "solid";
            //a.style.borderColor =  "red"; //"rgba(255,0,0,0.4)";
            var currentBackground:string = a.style.backgroundColor;
            a.style.backgroundColor = "rgba(255,0,0,0.7)";
            element.addEventListener("focus", function () {
                a.style.background = currentBackground;
            });
            //$(a).addClass("inputError").hide().show();
            return false;
        }
    }


    
}// class for const variables and methods




//-----------interface for JSON parsing-------------------
interface Data {
    gram:DataIng[];
    ml:DataIng[];
    temperature:DataIng[];
}
interface DataIng {
    iName:string;
    iCup:number;
    iSpoon:number;
    iTeaspoon:number;
}



//------------Classes-----------------------------------
class Ing {
    constructor(private iName:string) {
    }

    ingName():string {
        return this.iName;
    }

    print():string {
        return this.iName;
    }

    convertResult(grams:number, tool:string):number {
        return -1;
    }
} // class for one ingredient

class GramIng extends Ing {
    static className = "GramIng";
    private iGramToCup:number;
    private iGramToSpoon:number;
    private iGramToTeaspoon:number;

    constructor(iName:string, private iCupToGram:number, private iSpoonToGram:number, private iTeaspoonToGram:number) {
        super(iName);
        this.iGramToCup = 1 / this.iCupToGram;
        this.iGramToSpoon = 1 / this.iSpoonToGram;
        this.iGramToTeaspoon = 1 / this.iTeaspoonToGram;
    }

    print():string {
        return super.print() + " CupToGram:" + this.iCupToGram + " SpoonToGram:" + this.iSpoonToGram + " TeaspoonToGram:" + this.iTeaspoonToGram;
    }

    //@Override
    convertResult(grams:number, tool:string):number {
        let result:number;
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
    }//convert and get result in number

    static gramResultToScreen():void {
        let measureInput:HTMLInputElement = <HTMLInputElement>document.getElementById("gMeasure");
        let measure:number = parseInt(measureInput.value); // get grams from user
        //if (CN.validateInputNumber(measure)){ //if user put valid number
            let measureName:string = document.getElementById("gMeasureLabel").innerHTML; //get measure label (garm or ml)
            console.log(measureName);
            let toolSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("gToList");
            let tool:string = toolSelect.value; //get tool from user
            let ingSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("gIngList");
            let ingNumber:number = parseInt(ingSelect.value); //get ingredient from user
            console.log("measure: " + measure + " tool:" + tool);
            let result = CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool);
            if (result < 0) { //check if there is data
                document.getElementById("gResult").innerHTML = "are you nuts?? " + measure + " " + measureName + " of " + CN.getAllIng().getIngredients()[ingNumber].ingName() + "??";
            } else {
                document.getElementById("gResult").innerHTML = measure + " " + measureName + " is " + CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool) + " " + tool; // display result
            }
        document.getElementById("gResult").className = "result";
        //}

    } // method to calculate convert result and show it to the user - for gram only
} // class for gram convert ingredient

class MlIng extends Ing {
    static className = "MlIng";
    private iMlToCup:number;
    private iMlToSpoon:number;
    private iMlToTeaspoon:number;

    constructor(iName:string, private iCupToMl:number, private iSpoonToMl:number, private iTeaspoonToMl:number) {
        super(iName);
        this.iMlToCup = 1 / this.iCupToMl;
        this.iMlToSpoon = 1 / this.iSpoonToMl;
        this.iMlToTeaspoon = 1 / this.iTeaspoonToMl;
    }

    print():string {
        return super.print() + " CupToMl:" + this.iCupToMl + " SpoonToMl:" + this.iSpoonToMl + " TeaspoonToMl:" + this.iTeaspoonToMl;
    }

    //@Override
    convertResult(grams:number, tool:string):number {
        let result:number;
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
    }

    static mlResultToScreen():void {
        let measureInput:HTMLInputElement = <HTMLInputElement>document.getElementById("mMeasure");
        let measure:number = parseInt(measureInput.value); // get grams from user
        let measureName:string = document.getElementById("mMeasureLabel").innerHTML; //get measure label (garm or ml)
        console.log(measureName);
        let toolSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("mToList");
        let tool:string = toolSelect.value; //get tool from user
        let ingSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("mIngList");
        let ingNumber:number = parseInt(ingSelect.value); //get ingredient from user
        console.log("measure: " + measure + " tool:" + tool);
        let result = CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool);
        if (result < 0) { //check if there is data
            document.getElementById("mResult").innerHTML = "are you nuts?? " + measure + " " + measureName + " of " + CN.getAllIng().getIngredients()[ingNumber].ingName() + "??";
        } else {
            document.getElementById("mResult").innerHTML = measure + " " + measureName + " is " + CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool) + " " + tool; // display result
        }
        document.getElementById("mResult").className = "result";
    } // method to calculate convert result and show it to the user - for ml only
} // class for gram convert ingredient

class Temperature extends Ing {
    constructor(iName:string) {
        super(iName);
    }
    //@Override
    convertResult(degree:number, scale:string):number {
        let result:number = 0;
        switch (this.ingName()) {
            case "Fahrenheit":
                result = Math.round((degree - 32) / 1.8);
                break;
            case "Celsius":
                result = Math.round((degree * 1.8) + 32);
                break;
        }
        return result;
    }
    
    static temperatureResultToScreen():void {
        let degreeInput:HTMLInputElement = <HTMLInputElement>document.getElementById("tDegree");
        let degree:number = parseInt(degreeInput.value); // get degree from user
        let scaleSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("tIngList");
        let scaleNumber:number = parseInt(scaleSelect.value); //get scale number from user
        console.log("degree: " + degree);
        let result = CN.getAllIng().getIngredients()[scaleNumber].convertResult(degree, null);
        switch (CN.getAllIng().getIngredients()[scaleNumber].ingName()) {
            case "Fahrenheit":
                document.getElementById("tResult").innerHTML = degree + "&#176 Fahrenheit is " + result + "&#176 Celsius";
                break;
            case "Celsius":
                document.getElementById("tResult").innerHTML = degree + "&#176 Celsius is " + result + "&#176 Fahrenheit";
                break;
        }
        document.getElementById("tResult").className = "result";
    }// method to calculate convert result and show it to the user - for temperature only

    static toggleCeFa():void {
        let selected:HTMLSelectElement = <HTMLSelectElement>document.getElementById("tIngList");
        let selectedStr:string = selected.value;
        switch (selectedStr) {
            case "0":
                document.getElementById("tTo").innerHTML = "Celsius";
                break;
            case "1":
                document.getElementById("tTo").innerHTML = "Fahrenheit";
                break;
        }

    }
    
}//class for all Temperature related methods




/*CN.pushIngredient(new GramIng("bf", 100, 1, 2));
 CN.printIngArray();*/
//CN.getData();


//------------------------------------------------------

/*static calConvert():void {
 let measureInput:HTMLInputElement = <HTMLInputElement>document.getElementById("measure");
 let measure:number = parseInt(measureInput.value); // get grams from user
 let measureName:string = document.getElementById("measureLabel").innerHTML; //get measure label (garm or ml)
 console.log(measureName);
 let toolSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("toList");
 let tool:string = toolSelect.value; //get tool from user
 let ingSelect:HTMLSelectElement = <HTMLSelectElement>document.getElementById("ingList");
 let ingNumber:number = parseInt(ingSelect.value); //get ingredient from user
 console.log("measure: " + measure + " tool:" + tool);
 let result = CN.allIng.getIngredients()[ingNumber].convertResult(measure, tool);
 if (result < 0) { //check if there is data
 document.getElementById("result").innerHTML = "are you nuts?? " + measure + " " + measureName + " of " + CN.allIng.getIngredients()[ingNumber].ingName() + "??";
 } else {
 document.getElementById("result").innerHTML = measure + " " + measureName + " is " + CN.allIng.getIngredients()[ingNumber].convertResult(measure, tool) + " " + tool; // display result
 }
 } // method to calculate convert result and show it to the user - for gram and ml only*/

/*static validateInputNumber(measure:number):boolean{
 var rgx:RegExp = /\d/;
 console.log("is:" + rgx.test(measure.toString()));
 if (rgx.test(measure.toString())){
 return true;
 }else {
 console.log("pls enter a number");
 var a = document.getElementById("gMeasure").parentElement;
 //a.style.border = "solid";
 //a.style.borderColor =  "red"; //"rgba(255,0,0,0.4)";
 a.style.backgroundColor = "rgba(255,0,0,0.2)";
 a.addEventListener("focus", function () {
 a.style.background = "transparent";
 });
 //$(a).addClass("inputError").hide().show();
 return false;
 }
 }*/