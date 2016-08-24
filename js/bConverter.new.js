/// <reference path="../lib/jquery.d.ts" />
/// <reference path="../lib/jquerymobile.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//TODO update data in data files
//TODO getCountry function
//---------------- Listeners -----------------------------------
$(document).on("ready", function () {
    $("#gResult").hide();
    $("#mResult").hide();
    $("#tResult").hide();
    CN.setMeasureSystem();
    $('input[type=radio][name=mSystem]').change(function () {
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
            break;
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
        }); //.popup("open");
    }
});
//--------------Const Var's & methods-----------------------------
var CN = (function () {
    function CN() {
    }
    CN.getAllIng = function () {
        return this.allIng;
    }; //get private allAll
    CN.geocodingRequest = function (lonlat) {
        return "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lonlat + "&key=" + CN.apiKey;
    }; // address builder for google maps
    CN.getCountry = function () {
        function geoSuccess(pos) {
            $("#loading").popup("open");
            var lat = pos.coords.latitude;
            var lon = pos.coords.longitude;
            var lonlat = lat + "," + lon;
            console.log(CN.geocodingRequest(lonlat));
            $.getJSON(CN.geocodingRequest(lonlat), function (data) {
                var locationData = data;
                var result = data.results[0].address_components;
                result.forEach(function (item) {
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
                });
            });
        } // if navigator geoLocation request success
        function geoError(error) {
            $("#loading").popup("open");
            console.log(error);
            CN.setMeasureSystem();
            CN.getData();
        } // if navigator geoLocation request error
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError); // send the request
    }; //get countryfrom user and get the relevant data
    CN.setMeasureSystem = function (mSystem) {
        if (mSystem) {
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
        }
        else {
            CN.measureSystem = (localStorage.getItem("bConverterMeasureSystem")) ? localStorage.getItem("bConverterMeasureSystem") : "US";
            // check if measure system exist in local storage if not set default
            localStorage.setItem("bConverterMeasureSystem", CN.measureSystem); //update local storage
        }
        CN.bConvertData = "../data/data" + CN.measureSystem + ".json"; // update data file address
        console.log("CN.measureSystem: " + CN.measureSystem);
        $(".pSystemMeasureBtn").html(CN.measureSystem); // update indicator
        return CN.measureSystem;
    }; // setter for measure System
    CN.getMeasureSystem = function () {
        //CN.setMeasureSystem();
        return CN.measureSystem;
    }; //measure system is private
    CN.dataToSettingPage = function () {
        console.log("data to setting page");
        var key = "bConverterData" + CN.measureSystem;
        var data = localStorage.getItem(key);
        var obResponse = JSON.parse(data); //parse response
        var volume = new VolumeIng(obResponse.ml[0].iName, obResponse.ml[0].iCup, obResponse.ml[0].iSpoon, obResponse.ml[0].iTeaspoon);
        $("#settingMeasure").html(volume.print());
    };
    CN.dataToArray = function (className) {
        var key = "bConverterData" + CN.measureSystem;
        var data = localStorage.getItem(key);
        var url = "";
        var obResponse = JSON.parse(data); //parse response
        switch (className) {
            case "WeightIng":
                CN.allIng = new AllIng();
                url = "#pWeight";
                for (var i = 0; i < obResponse.gram.length; i++) {
                    CN.allIng.pushIngredient(new WeightIng(obResponse.gram[i].iName, obResponse.gram[i].iCup, obResponse.gram[i].iSpoon, obResponse.gram[i].iTeaspoon));
                }
                break;
            case ("VolumeIng"):
                CN.allIng = new AllIng();
                url = "#pVolume";
                CN.allIng.pushIngredient(new VolumeIng(obResponse.ml[0].iName, obResponse.ml[0].iCup, obResponse.ml[0].iSpoon, obResponse.ml[0].iTeaspoon));
                break;
            case ("Temperature"):
                CN.allIng = new AllIng();
                url = "#pTemperature";
                for (var i = 0; i < obResponse.temperature.length; i++) {
                    CN.allIng.pushIngredient(new Temperature(obResponse.temperature[i].iName));
                }
                break;
        }
        CN.allIng.printIngArray();
        CN.putDataInSelectList(className); // put ingredients names in the select list
        $.mobile.changePage(url, {
            dataUrl: "h",
            showLoadMsg: true
        }); // go to the page
    }; //get json string, parse it, put in array, display to user
    CN.getData = function (className) {
        $("#loading").popup("open");
        var tempResponse;
        var key = "bConverterData" + CN.measureSystem;
        var page = CN.activePage;
        console.log(page);
        if (localStorage.getItem(key)) {
            tempResponse = localStorage.getItem(key); //get response
            if (CN.activePage == "pSetting") {
                CN.dataToSettingPage();
            }
            CN.loadingOff();
        }
        else {
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
    }; //generic method to get data from server or localstorage and put it in the ingredients array
    //--------DOM, input, result -------------
    CN.putDataInSelectList = function (className) {
        var listId = "";
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
        var select = document.getElementById(listId);
        select.length = 0;
        for (var i = 0; i < CN.allIng.getIngredients().length; i++) {
            var opt = document.createElement("option"); //create option
            opt.value = i.toString(); // put value in option
            opt.text = CN.allIng.getIngredients()[i].ingName(); // put text in option
            if (i == 0) {
                opt.setAttribute("selected", "true");
            }
            select.appendChild(opt); //put option in the list
        }
        //select.value = "0";
    }; // method to put options in select ingredients html list
    CN.validateInputNum = function (element) {
        var measure = parseInt($(element).val());
        var rgx = /\d/;
        console.log("is:" + rgx.test(measure.toString()));
        var eId = $(element).attr("id")[0];
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
        }
        else {
            console.log("pls enter a number");
            var currentBackground = $(element).parent().css("background-color"); //a.style.backgroundColor;
            $(element).parent().css("background-color", "rgba(255,0,0,0.7)");
            $(element).on("focus", function () {
                $(element).parent().css("background-color", currentBackground);
            });
            return false;
        }
    }; //validate user input and pass if validated
    CN.loadingOff = function () {
        setTimeout(function () {
            $("#loading").popup("close");
        }, 1500);
    };
    CN.goToSetting = function () {
        $.mobile.changePage("#pSetting", {
            dataUrl: "h",
            showLoadMsg: true
        }); // go to the page
    }; // go to setting page
    CN.convertTool = function (tool, result) {
        return (result > 1) ? tool + "s" : tool;
    }; // get tool & result and return cups or cup
    CN.dataReady = false;
    CN.activePage = "home"; // to store active page
    CN.bConvertData = "../data/dataUS.json"; //address for data file in use
    //private static query: string = "";
    //---------find country with google maps------------
    CN.apiKey = "AIzaSyDzyEu__JkZf-ao55rgd6BtLxhHk4493b4"; // api  key for google maps
    CN.userCountryLong = "";
    CN.userCountryShort = "";
    //---------measure system----------------
    CN.measureSystem = ""; // var for measure System
    //---------- data handling ------------
    CN.ingRequest = new XMLHttpRequest(); //xhr to get ingredient from server
    return CN;
}()); // class for const variables and methods
//------------Classes-----------------------------------
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
}()); //generic class for array for ingredient for all child's of Ing
var Ing = (function () {
    function Ing(iName) {
        this.iName = iName;
    }
    Ing.prototype.ingName = function () {
        return this.iName;
    };
    Ing.prototype.print = function () {
        return "";
    }; // for override
    Ing.prototype.convertResult = function (grams, tool) {
        return -1;
    }; // for override
    return Ing;
}()); // class for one ingredient
var WeightIng = (function (_super) {
    __extends(WeightIng, _super);
    function WeightIng(iName, iCupToGram, iSpoonToGram, iTeaspoonToGram) {
        _super.call(this, iName);
        this.iCupToGram = iCupToGram;
        this.iSpoonToGram = iSpoonToGram;
        this.iTeaspoonToGram = iTeaspoonToGram;
        this.iGramToCup = 1 / this.iCupToGram;
        this.iGramToSpoon = 1 / this.iSpoonToGram;
        this.iGramToTeaspoon = 1 / this.iTeaspoonToGram;
    }
    WeightIng.prototype.print = function () {
        return _super.prototype.print.call(this) + " CupToGram:" + this.iCupToGram + " SpoonToGram:" + this.iSpoonToGram + " TeaspoonToGram:" + this.iTeaspoonToGram;
    };
    //@Override
    WeightIng.prototype.convertResult = function (grams, tool) {
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
    }; //convert and get result in number
    WeightIng.gramResultToScreen = function () {
        var measure = parseInt($("#gMeasure").val()); // get grams from user
        var measureName = $("#gMeasureLabel").html(); //get measure label (garm or ml)
        console.log(measureName);
        var tool = $("#gToList").val(); //get tool from user
        var ingNumber = parseInt($("#gIngList").val()); //get ingredient from user
        console.log("measure: " + measure + " tool:" + tool);
        var result = CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool);
        if (result < 0) {
            $("#gResult").html("Can't convert to " + tool).show().css("display", "inline-block");
        }
        else {
            var toolToPrint = CN.convertTool(tool, result);
            $("#gResult").html(measure + " " + measureName + " = " + result + " " + toolToPrint).show().css("display", "inline-block"); // display result
        }
    }; // method to calculate convert result and show it to the user - for gram only
    WeightIng.className = "WeightIng";
    return WeightIng;
}(Ing)); // class for gram convert ingredient
var VolumeIng = (function (_super) {
    __extends(VolumeIng, _super);
    function VolumeIng(iName, iCupToMl, iSpoonToMl, iTeaspoonToMl) {
        _super.call(this, iName);
        this.iCupToMl = iCupToMl;
        this.iSpoonToMl = iSpoonToMl;
        this.iTeaspoonToMl = iTeaspoonToMl;
        this.iMlToCup = 1 / this.iCupToMl;
        this.iMlToSpoon = 1 / this.iSpoonToMl;
        this.iMlToTeaspoon = 1 / this.iTeaspoonToMl;
    }
    VolumeIng.prototype.print = function () {
        return _super.prototype.print.call(this) + "Cup = " + this.iCupToMl + "ml<br> Spoon = " + this.iSpoonToMl + "ml<br> Teaspoon = " + this.iTeaspoonToMl + "ml";
    };
    //@Override
    VolumeIng.prototype.convertResult = function (grams, tool) {
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
    VolumeIng.mlResultToScreen = function () {
        var measure = parseInt($("#mMeasure").val()); // get grams from user
        var measureName = $("#mMeasureLabel").html(); //get measure label (garm or ml)
        console.log(measureName);
        var tool = $("#mToList").val(); //get tool from user
        var ingNumber = parseInt($("#mIngList").val()); //get ingredient from user
        console.log("measure: " + measure + " tool:" + tool);
        var result = CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool);
        if (result < 0) {
            $("#mResult").html("are you nuts?? " + measure + " " + measureName + " of " + CN.getAllIng().getIngredients()[ingNumber].ingName() + "??").show().css("display", "inline-block");
        }
        else {
            $("#mResult").html(measure + " " + measureName + " = " + CN.getAllIng().getIngredients()[ingNumber].convertResult(measure, tool) + " " + tool).show().css("display", "inline-block"); // display result
        }
    }; // method to calculate convert result and show it to the user - for ml only
    VolumeIng.className = "VolumeIng";
    return VolumeIng;
}(Ing)); // class for gram convert ingredient
var Temperature = (function (_super) {
    __extends(Temperature, _super);
    function Temperature(iName) {
        _super.call(this, iName);
    }
    //@Override
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
    Temperature.temperatureResultToScreen = function () {
        var degree = parseInt($("#tDegree").val()); // get degree from user
        var scaleNumber = parseInt($("#tIngList").val()); //get scale number from user
        console.log("degree: " + degree);
        var result = CN.getAllIng().getIngredients()[scaleNumber].convertResult(degree, null);
        switch (CN.getAllIng().getIngredients()[scaleNumber].ingName()) {
            case "Fahrenheit":
                $("#tResult").html(degree + "&#176 Fahrenheit = " + result + "&#176 Celsius").show().css("display", "inline-block");
                break;
            case "Celsius":
                $("#tResult").html("#tResult").html(degree + "&#176 Celsius = " + result + "&#176 Fahrenheit").show().css("display", "inline-block");
                break;
        }
    }; // method to calculate convert result and show it to the user - for temperature only
    Temperature.toggleCeFa = function () {
        //let selected: HTMLSelectElement = <HTMLSelectElement>document.getElementById("tIngList");
        var selectedStr = $("#tIngList").val(); //selected.value;
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
    };
    return Temperature;
}(Ing)); //class for all Temperature related methods
//# sourceMappingURL=bConverter.new.js.map