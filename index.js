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
            console.log(guestList);
            res.render('namelist', {guest: guestList});
        }
    });
});

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