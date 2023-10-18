const express = require('express'); 
const dateTime = require('./dateTime_ET');
const fs = require('fs');
const app = express(); 

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/timenow',(req,res)=>{
    const dateNow = dateTime.dateETformatted();
    const timeNow = dateTime.timeETformatted();
    res.render('timenow', {dateN: dateNow, timeN: timeNow});
});

app.get('/folk',(req,res)=>{
    let folkWisdom = [];
    fs.readFile('public/txtfiles/vanasona.txt', 'utf8', (err, data)=>{
        if(err){
            throw err;
        }
        else{
            folkWisdom = data.split(';');
            res.render('justlist', {h1: 'Vanasõnad', wisdom: folkWisdom});
        }
    });
});

app.get('/guests', (req,res)=>{
    let guestList = [];
    fs.readFile('public/txtfiles/namelog.txt', 'utf8', (err, data)=>{
        if (err){
            throw err;
        }
        else{
            guestList = data.split(';');
            guestList = openArr(guestList)
            let person = [];
            let nameDate = [];
            let i = 0;
            let m = 0;
            while (i < guestList.length){
                let first = guestList[i];
                let last = guestList[i + 1];
                person = person.concat(first + " " + last);
                i = i + 3; // [eesnimi, pnimi, aeg; ...]
            }
            while(m < guestList.length){
                let date = guestList[m + 2];
                nameDate = nameDate.concat(date);
                m = m + 3;
            }
            /*console.log(guestList)
            console.log(person)*/
            nameDate = dateTime.ENtoET(nameDate);
            res.render('namelist', {guest: guestList, person: person, nameDate: nameDate}); // guestList -> kõik nimekirja elemendid; person -> ainult nimi; date -> kuupäev
        }
    });
});

function openArr(bigArr){
    bigArr.pop(); // eemaldab viimase tühja elemendi
    smolArr = bigArr.toString(); // muudab array tagasi stringiks
    bigArr = smolArr.split(','); // loob stringist uue array, ilma komadetta --> väga ebaefektiivne.
    return bigArr
}

app.listen(5133);

// comments
// Express.js framework
 // võib teha ka res.download('index.js'); -> laeb veebilehe alla; res -> response/vaste, req -> request/päring
 // app -> standard jälle
 // res.send -> saadab lihtsalt koodi enda
 // res. render -> võtab html koodi
 // ejs mooduli sai -> npm install ejs; index peab ümber nimetama .ejs extensioninga
 // .use -> nõuab vahevara/ middleware ;static -> koht ei muutu, sulgudes dir
 // require arvab, et kõik failid .js ext ehk ei pea seda kirja panema
 // res.render('timenow', {dateN: dateNow, timeN: timeNow});; --> {objekti nimetus: objekti väärtus, uue objekt inimetus: uue objekt iväärtus}
 // <%= ejs muutuja nimi %> ; ejs moodulite kasutamine html-is