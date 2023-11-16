const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
require

const dateETformatted = function(){
    
    let timeNow = new Date();
    return timeNow.getDate() + ". " + monthNamesET[timeNow.getMonth()] + " " + timeNow.getFullYear();
}

const timeETformatted = function(){
    let timeNow = new Date();
    return timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();
}

const timeOfDayET = function(){
    let partOfDay = "Suvaline hetk";
    let hourNow = new Date().getHours();
    if(hourNow >= 6 && hourNow <= 12){
        partOfDay = "Hommik";
    }
    if(hourNow >= 14 && hourNow <= 18){
        partOfDay = "Pärastlõuna";
    }
    if(hourNow >= 18 && hourNow <= 22){
        partOfDay = "Õhtu";
    }
    if(hourNow >= 22 && hourNow <= 5){
        partOfDay = "ÖÖ";
    }
    return partOfDay;
}

// us time -> kuu/päev/aasta
// nt 10/11/2023 --> 11. oktoober 2023
const ENtoET = function(dateEN){
    let timeArr = dateEN;
    let timeStr = timeArr.toString();
    timeArr = timeStr.split('/');
    timeStr = timeArr.toString();
    timeArr = timeStr.split(',');
    let timeENtoET = ""
    let i = 0
    while (i< timeArr.length){
    timeENtoET = timeENtoET.concat(timeArr[i+1] + "." + monthNamesET[Number(timeArr[i])-1] + " " + timeArr[i+2] + ";");
    i = i + 3 };
    return timeArr = timeENtoET.split(';') 
}

// SQL-formaadis aeg
const dateSql = function(){
    let timeNow = new Date();
    return timeNow.getFullYear() + '-' + timeNow.getMonth() + '-' + timeNow.getDate();
}

const dateTimeSql = function(unix){
    let timeNow = new Date(unix * 1000);
    return timeNow.getDate() + ". " + monthNamesET[timeNow.getMonth()] + " " + timeNow.getFullYear();
}

// ekspordib kõik asjad
module.exports = {dateETformatted: dateETformatted, timeETformatted: timeETformatted, monthsET: monthNamesET, timeOfDayET: timeOfDayET, ENtoET: ENtoET, dateSql:dateSql, dateTimeSql: dateTimeSql};