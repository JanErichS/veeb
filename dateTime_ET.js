const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];

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

// ekspordib kõik asjad
module.exports = {dateETformatted: dateETformatted, timeETformatted: timeETformatted, monthsET: monthNamesET, timeOfDayET: timeOfDayET}