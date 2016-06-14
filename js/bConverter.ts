/**
 * Created by Elad on 10/06/2016.
 */

//--------------Const Var's-----------------------------

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
}
class CN {
    private static ingRequest:XMLHttpRequest = new XMLHttpRequest(); //xhr to get ingredient from server
    private static allIng; //initialize new array for ingredients

    static getData(className):void {
        switch (className){
            case "GramIng":
                CN.allIng = new AllIng<GramIng>();
                break;
            case "MlIng":
                CN.allIng = new AllIng<MlIng>();
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
                }
                CN.allIng.printIngArray();
                CN.putDataInSelectList();// put ingredients names in the select list
            }

        };
        this.ingRequest.send(null);
    } //method to get data from server and put it in the ingredients array

    static putDataInSelectList():void {
        for (let i:number = 0; i < CN.allIng.getIngredients().length; i++) {
            let opt = document.createElement("option"); //create option
            opt.value = i.toString(); // put value in option
            opt.text = CN.allIng.getIngredients()[i].ingName(); // put text in option
            let select = document.getElementById("ingList");
            select.appendChild(opt); //put option in the list
        }
    } // method to put options in select ingredients html list

    static calConvert():void {
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
    } // method to calculate convert result and show it to the user

}// class for const variables and methods

//-----------interface for JSON parsing-------------------
interface Data {
    gram:DataIng[];
    ml:DataIng[];
    pack:DataIng[];
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
    }
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
} // class for gram convert ingredient


/*CN.pushIngredient(new GramIng("bf", 100, 1, 2));
 CN.printIngArray();*/
//CN.getData();


//------------------------------------------------------

