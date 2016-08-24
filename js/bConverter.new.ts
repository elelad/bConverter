/// <reference path="../lib/jquery.d.ts" />
/// <reference path="../lib/jquerymobile.d.ts" />


//TODO update data in data files
//TODO getCountry function


//---------------- Listeners -----------------------------------
$(document).on("ready", function () {
    $("#gResult").hide();
    $("#mResult").hide();
    $("#tResult").hide();
    CN.setMeasureSystem();
    $('input[type=radio][name=mSystem]').change(function () {// if user changed measure system
        CN.setMeasureSystem(this.value);
        $("#pSystemMeasureBtn").html(CN.getMeasureSystem());
        CN.getData(); //if measure system changed then get new data
    });
    $("#locationYesBtn").on("click", function () {
        $("#locationPopup").popup("close");
        $("#loading").popup("open");
        CN.getCountry();
    });
    $("#locationNoBtn").on("click", function () {
        $("#locationPopup").popup("close");
        $("#loading").popup("open");
        CN.setMeasureSystem();
        CN.getData();
    });
    //CN.getCountry();
});
$(document).on("pagecontainerbeforechange", function (event, ui) {
    CN.activePage = ui.toPage[0].id;
    switch (CN.activePage) {
        case "pWeight":
            $("#gMeasure").focus();
            break;
        case "pVolune":
            $("#mMeasure").focus();
            break;
        case "pTemperature":
            $("#tDegree").focus();
            break;
        case "home":
            break;
        case "pSetting":
            $("#r" + CN.getMeasureSystem()).prop('checked', true).checkboxradio("refresh");
            CN.dataToSettingPage();
            //$("#systemFildset").trigger("create");
            break
    }
});
$(document).on("pagecontainershow", function (event, ui) {
    $("#loading").popup({
        overlayTheme: "b",
        transition: "pop",
        history: false
    });
    if ((ui.toPage[0].id == "home") && (ui.prevPage.length == 0)) {
        //var popupPos = $("#popupPos");
        $("#locationPopup").popup({
            positionTo: "#popupPos",
            overlayTheme: "b",
            transition: "pop",
            history: false
        });//.popup("open");
    }

});

//--------------Const Var's & methods-----------------------------
class CN {
    static dataReady: boolean = false;
    static activePage: string = "home"; // to store active page
    private static allIng; //initialize new array for ingredients
    static getAllIng() {
        return this.allIng;
    } //get private allAll
    private static bConvertData = "../data/dataUS.json"; //address for data file in use

    //private static query: string = "";

    //---------find country with google maps------------
    private static apiKey: string = "AIzaSyDzyEu__JkZf-ao55rgd6BtLxhHk4493b4"; // api  key for google maps
    private static geocodingRequest(lonlat: string): string {
        return "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lonlat + "&key=" + CN.apiKey;
    } // address builder for google maps
    private static userCountryLong: string = "";
    private static userCountryShort: string = "";
    static getCountry(): void {
        function geoSuccess(pos: Position): void {
            $("#loading").popup("open");
            var lat = pos.coords.latitude;
            var lon = pos.coords.longitude;
            var lonlat: string = lat + "," + lon;
            console.log(CN.geocodingRequest(lonlat));
            $.getJSON(CN.geocodingRequest(lonlat), function (data) {
                var locationData: any = data;
                var result: any[] = data.results[0].address_components;
                result.forEach(item=> {
                    if (item.types[0] == "country") {
                        console.log("long: " + item.long_name + " short: " + item.short_name);
                        CN.userCountryLong = item.long_name;
                        CN.userCountryShort = item.short_name;
                        CN.setMeasureSystem(CN.userCountryShort);
                        if (CN.activePage == "pSetting") {
                            $("input[type=radio][name=mSystem]").prop('checked', false).checkboxradio("refresh");
                            $("#r" + CN.getMeasureSystem()).prop('checked', true).checkboxradio("refresh");
                        }
                        CN.getData();
                    }
                })
            })
        } // if navigator geoLocation request success
        function geoError(error) {
            $("#loading").popup("open");
            console.log(error);
            CN.setMeasureSystem();
            CN.getData();
        } // if navigator geoLocation request error
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError); // send the request
    }//get countryfrom user and get the relevant data

    //---------measure system----------------
    private static measureSystem: string = ""; // var for measure System
    static setMeasureSystem(mSystem?: string): string {
        if (mSystem) { // if prefered measure System passed to the function
            switch (mSystem) {
                case "IL":
                case "US":
                case "UK":
                case "AU":
                case "CA":
                    CN.measureSystem = mSystem;
                    break;
                case "":
                    break;
                default:
                    CN.measureSystem = "US";
                    console.log(mSystem);
            }
            localStorage.setItem("bConverterMeasureSystem", CN.measureSystem);
        } else { // if prefered measure System didnt passed to the function
            CN.measureSystem = (localStorage.getItem("bConverterMeasureSystem")) ? localStorage.getItem("bConverterMeasureSystem") : "US";
                // check if measure system exist in local storage if not set default
            localStorage.setItem("bConverterMeasureSystem", CN.measureSystem); //update local storage
        }
        CN.bConvertData = "../data/data" + CN.measureSystem + ".json"; // update data file address
        console.log("CN.measureSystem: " + CN.measureSystem);
        $(".pSystemMeasureBtn").html(CN.measureSystem); // update indicator
        return CN.measureSystem;
    } // setter for measure System
    static getMeasureSystem() {
        //CN.setMeasureSystem();
        return CN.measureSystem;
    } //measure system is private

    //---------- data handling ------------
    private static ingRequest: XMLHttpRequest = new XMLHttpRequest(); //xhr to get ingredient from server
    static dataToSettingPage() {
        console.log("data to setting page");
        var key = "bConverterData" + CN.measureSystem;
        var data: string = localStorage.getItem(key);
        let obResponse: Data = JSON.parse(data); //parse response
        var volume = new VolumeIng(obResponse.ml[0].iName, obResponse.ml[0].iCup, obResponse.ml[0].iSpoon,
            obResponse.ml[0].iTeaspoon);
        $("#settingMeasure").html(volume.print());
    }
    static dataToArray(className: string): void {
        var key = "bConverterData" + CN.measureSystem;
        var data: string = localStorage.getItem(key);
        var url: string = "";
        let obResponse: Data = JSON.parse(data); //parse response
        switch (className) {
            case "WeightIng":
                CN.allIng = new AllIng<WeightIng>();
                url = "#pWeight";
                for (let i: number = 0; i < obResponse.gram.length; i++) { // put data in array
                    CN.allIng.pushIngredient(new WeightIng(obResponse.gram[i].iName, obResponse.gram[i].iCup, obResponse.gram[i].iSpoon,
                        obResponse.gram[i].iTeaspoon));
                }
                break;
            case ("VolumeIng"):
                CN.allIng = new AllIng<VolumeIng>();
                url = "#pVolume";
                CN.allIng.pushIngredient(new VolumeIng(obResponse.ml[0].iName, obResponse.ml[0].iCup, obResponse.ml[0].iSpoon,
                    obResponse.ml[0].iTeaspoon));
                break;
            case ("Temperature"):
                CN.allIng = new AllIng<Temperature>();
                url = "#pTemperature";
                for (let i: number = 0; i < obResponse.temperature.length; i++) { // put data in array
                    CN.allIng.pushIngredient(new Temperature(obResponse.temperature[i].iName));
                }
                break;
        }
        CN.allIng.printIngArray();
        CN.putDataInSelectList(className);// put ingredients names in the select list
        $.mobile.changePage(url, {
            dataUrl: "h",
            showLoadMsg: true
        });// go to the page
    }//get json string, parse it, put in array, display to user
    static getData(className?: string): void {
        $("#loading").popup("open");
        var tempResponse: string;
        var key = "bConverterData" + CN.measureSystem;
        var page: string = CN.activePage;
        console.log(page);
        if (localStorage.getItem(key)) { //if there is local data get it
            tempResponse = localStorage.getItem(key); //get response
            if (CN.activePage == "pSetting") {
                CN.dataToSettingPage();
            }
            CN.loadingOff();
        } else { //if there isnt local data get it from the server
            CN.ingRequest.abort();
            CN.ingRequest.open("GET", CN.bConvertData, true);
            CN.ingRequest.onreadystatechange = function () {
                if (CN.ingRequest.readyState == 4 && CN.ingRequest.status == 200) {
                    tempResponse = CN.ingRequest.responseText; //get response
                    localStorage.setItem(key, tempResponse);
                    CN.dataReady = true;
                    //console.log(JSON.parse(tempResponse));
                    if (CN.activePage == "pSetting") {
                        CN.dataToSettingPage();
                    }
                    CN.loadingOff();
                }

            };
            this.ingRequest.send(null);
        }
    } //generic method to get data from server or localstorage and put it in the ingredients array

    //--------DOM, input, result -------------
    static putDataInSelectList(className: string): void {
        var listId: string = "";
        switch (className) {
            case "WeightIng":
                listId = "gIngList";
                break;
            case "VolumeIng":
                listId = "mIngList";
                break;
            case "Temperature":
                listId = "tIngList";
                break;
        }
        var select: HTMLSelectElement = <HTMLSelectElement>document.getElementById(listId);
        select.length = 0;
        for (let i: number = 0; i < CN.allIng.getIngredients().length; i++) {
            let opt = document.createElement("option"); //create option
            opt.value = i.toString(); // put value in option
            opt.text = CN.allIng.getIngredients()[i].ingName(); // put text in option
            if (i == 0) {
                opt.setAttribute("selected", "true");
            }
            select.appendChild(opt); //put option in the list
        }
        //select.value = "0";

    } // method to put options in select ingredients html list
    static validateInputNum(element: HTMLInputElement): boolean {
        var measure: number = parseInt($(element).val());
        var rgx: RegExp = /\d/;
        console.log("is:" + rgx.test(measure.toString()));
        var eId: string = $(element).attr("id")[0];
        console.log("id[0]:" + eId);
        if (rgx.test(measure.toString()) && measure != 0) {
            switch (eId) {
                case "g":
                    WeightIng.gramResultToScreen();
                    break;
                case "m":
                    VolumeIng.mlResultToScreen();
                    break;
                case "t":
                    Temperature.temperatureResultToScreen();
                    break;
            }
            return true;
        } else {
            console.log("pls enter a number");
            var currentBackground: string = $(element).parent().css("background-color"); //a.style.backgroundColor;
            $(element).parent().css("background-color", "rgba(255,0,0,0.7)");
            $(element).on("focus", function () {
                $(element).parent().css("background-color", currentBackground);
            });
            return false;
        }
    }//validate user input and pass if validated
    static loadingOff() {
        setTimeout(function () {
            $("#loading").popup("close");
        }, 1500)
    }
    static goToSetting() {
        $.mobile.changePage("#pSetting", {
            dataUrl: "h",
            showLoadMsg: true
        });// go to the page
    } // go to setting page
    static convertTool(tool: string, result: number) {
        return (result > 1) ? tool + "s" : tool;
    }// get tool & result and return cups or cup
}// class for const variables and methods


//-----------interface for JSON parsing-------------------
interface Data {
    gram: DataIng[];
    ml: DataIng[];
    temperature: DataIng[];
}
interface DataIng {
    iName: string;
    iCup: number;
    iSpoon: number;
    iTeaspoon: number;
}


//------------Classes-----------------------------------
class AllIng<T extends Ing> {
    private aIngredients: T[] = []; //array for all ingredients for a kind
    pushIngredient(ing: T): void {
        this.aIngredients.push(ing);
    }//method to push ingredient to array
    printIngArray(): void {
        for (let i: number = 0; i < this.aIngredients.length; i++) {
            console.log(this.aIngredients[i].print());
        }
    }

    getIngredients(): T[] {
        return this.aIngredients;
    }
} //generic class for array for ingredient for all child's of Ing

class Ing {
    constructor(private iName: string) {
    }

    ingName(): string {
        return this.iName;
    }

    print(): string {
        return "";
    }// for override

    convertResult(grams: number, tool: string): number {
        return -1;
    } // for override
} // class for one ingredient

class WeightIng extends Ing {
    static className = "WeightIng";
    private iGramToCup: number;
    private iGramToSpoon: number;
    private iGramToTeaspoon: number;

    constructor(iName: string, private iCupToGram: number, private iSpoonToGram: number, private iTeaspoonToGram: number) {
        super(iName);
        this.iGramToCup = 1 / this.iCupToGram;
        this.iGramToSpoon = 1 / this.iSpoonToGram;
        this.iGramToTeaspoon = 1 / this.iTeaspoonToGram;
    }

    print(): string {
        return super.print() + " CupToGram:" + this.iCupToGram + " SpoonToGram:" + this.iSpoonToGram + " TeaspoonToGram:" + this.iTeaspoonToGram;
    }

    //@Override
    convertResult(grams: number, tool: string): number {
        let result: number;
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

    static gramResultToScreen(): void {
        let measure: number = parseInt($("#gMeasure").val()); // get grams from user
        let measureName: string = $("#gMeasureLabel").html(); //get measure label (garm or ml)
        console.log(measureName);
        let tool: string = $("#gToList").val(); //get tool from user
        let ingNumber: number = parseInt($("#gIngList").val()); //get ingredient from user
        console.log("measure: " + measure + " tool:" + tool);
        let result = CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool);
        if (result < 0) { //check if there is data
            $("#gResult").html("Can't convert to " + tool).show().css("display", "inline-block");
            /*$("#gResult").html("are you nuts?? " + measure + " " + measureName + " of " + CN.getAllIng().getIngredients()[ingNumber]                .ingName() + "??").show().css("display", "inline-block");*/
        } else {
            let toolToPrint = CN.convertTool(tool, result);
            $("#gResult").html(measure + " " + measureName + " = " + result + " " + toolToPrint).show().css("display", "inline-block"); // display result
        }
    } // method to calculate convert result and show it to the user - for gram only
} // class for gram convert ingredient

class VolumeIng extends Ing {
    static className = "VolumeIng";
    private iMlToCup: number;
    private iMlToSpoon: number;
    private iMlToTeaspoon: number;

    constructor(iName: string, private iCupToMl: number, private iSpoonToMl: number, private iTeaspoonToMl: number) {
        super(iName);
        this.iMlToCup = 1 / this.iCupToMl;
        this.iMlToSpoon = 1 / this.iSpoonToMl;
        this.iMlToTeaspoon = 1 / this.iTeaspoonToMl;
    }

    print(): string {
        return super.print() + "Cup = " + this.iCupToMl + "ml<br> Spoon = " + this.iSpoonToMl + "ml<br> Teaspoon = " + this.iTeaspoonToMl + "ml";
    }

    //@Override
    convertResult(grams: number, tool: string): number {
        let result: number;
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

    static mlResultToScreen(): void {
        let measure: number = parseInt($("#mMeasure").val()); // get grams from user
        let measureName: string = $("#mMeasureLabel").html(); //get measure label (garm or ml)
        console.log(measureName);
        let tool: string = $("#mToList").val(); //get tool from user
        let ingNumber: number = parseInt($("#mIngList").val()); //get ingredient from user
        console.log("measure: " + measure + " tool:" + tool);
        let result = CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool);
        if (result < 0) { //check if there is data
            $("#mResult").html("are you nuts?? " + measure + " " + measureName + " of " + CN.getAllIng().getIngredients()[ingNumber]                .ingName() + "??").show().css("display", "inline-block");
        } else {
            $("#mResult").html(measure + " " + measureName + " = " + CN.getAllIng().getIngredients()                   [ingNumber]                 .convertResult(measure, tool) + " " + tool).show().css("display", "inline-block"); // display result
        }
    } // method to calculate convert result and show it to the user - for ml only
} // class for gram convert ingredient

class Temperature extends Ing {
    constructor(iName: string) {
        super(iName);
    }

    //@Override
    convertResult(degree: number, scale: string): number {
        let result: number = 0;
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

    static temperatureResultToScreen(): void {
        let degree: number = parseInt($("#tDegree").val()); // get degree from user
        let scaleNumber: number = parseInt($("#tIngList").val()); //get scale number from user
        console.log("degree: " + degree);
        let result = CN.getAllIng().getIngredients()[scaleNumber].convertResult(degree, null);
        switch (CN.getAllIng().getIngredients()[scaleNumber].ingName()) {
            case "Fahrenheit":
                $("#tResult").html(degree + "&#176 Fahrenheit = " + result + "&#176 Celsius").show().css("display", "inline-block");
                break;
            case "Celsius":
                $("#tResult").html("#tResult").html(degree + "&#176 Celsius = " + result + "&#176 Fahrenheit").show().css("display",
                    "inline-block");
                break;
        }
    }// method to calculate convert result and show it to the user - for temperature only

    static toggleCeFa(): void {
        //let selected: HTMLSelectElement = <HTMLSelectElement>document.getElementById("tIngList");
        let selectedStr: string = $("#tIngList").val();  //selected.value;
        switch (selectedStr) {
            case "0":
                //document.getElementById("tTo").innerHTML = "Celsius";
                $("#tTo").html("Celsius");
                break;
            case "1":
                //document.getElementById("tTo").innerHTML = "Fahrenheit";
                $("#tTo").html("Fahrenheit");
                break;
        }
        $("#tDegree").focus();
    }

}//class for all Temperature related methods



