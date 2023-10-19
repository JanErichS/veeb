const express = require('express'); 
const fs = require('fs');
const app = express(); 
const mysql = require('mysql2');
const bodyparser = require('body-parser');

// isetehtud moodulid
const dateTime = require('./dateTime_ET');
const dbInfo = require('../../vp23config')

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));

// andmebaasiga ühendus
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.password,
    database: dbInfo.configData.database
});

// avaleht
app.get('/', (req, res)=>{
    res.render('index');
});

// kellaaeg
app.get('/timenow', (req, res)=>{
    const dateNow = dateTime.dateETformatted();
    const timeNow = dateTime.timeETformatted();
    res.render('timenow', {dateN: dateNow, timeN: timeNow});
});

// vanasõnad
app.get('/folk', (req, res)=>{
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

// külastajad
app.get('/guests', (req, res)=>{
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
            res.render('namelist', {guest: guestList, person: person, nameDate: nameDate}); // guestList -> kõik nimekirja elemendid; person -> ainult nimi; nameDate -> kuupäev
        }
    });
});

// filmide avaleht
app.get('/movies', (req, res)=>{
    res.render('filmindex');
});

// filmide nimekiri
app.get('/movies/filmiloend', (req, res)=>{
    let sql = 'SELECT id, title, production_year, duration FROM movie';
    let sqlResult = [];
    conn.query(sql, (err, result)=>{
        if (err){
            res.render('filmlist', {filmList: result});
            throw err;
        }
        else{
            res.render('filmlist', {filmList: result});
        }
    });
});

// filmitegelase lisamine
app.get('/movies/addfilmperson', (req, res)=>{
    res.render('addfilmperson');
});

app.get('/movies/singlemovie', (req, res)=>{
    let sql = 'SELECT count(id) FROM movie';
    conn.query(sql, (err, result)=>{
        if (err){
            throw err;
        }
        else{
            console.log(result)
            res.render('singlemovie', {movieNum: result})
        }
    });
});

// funktsioonid
function openArr(bigArr){
    bigArr.pop(); // eemaldab viimase tühja elemendi
    smolArr = bigArr.toString(); // muudab array tagasi stringiks
    bigArr = smolArr.split(','); // loob stringist uue array, ilma komadetta --> väga ebaefektiivne.
    return bigArr
};

// formsi jaoks post rooting
app.post('/movies/addfilmperson', (req, res)=>{
    let notice = '';
    let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES(?,?,?)';
    conn.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.dateOfBirth], (err, result)=>{
        if (err){
            notice = 'Andmete salvestamine ebaõnnestus (bad ending)';
            res.render('addfilmperson', {notice: notice});
            throw err;
        }
        else{
            notice = req.body.firstNameInput + ' ' + req.body.lastNameInput + ' salvestamine õnnestus';
            res.render('addfilmperson', {notice: notice})
        }
    });
});

app.post('/movies/singlemovie', (req, res)=>{

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

 //     conn.query(sql, (err, result, fields) --> fields annab tehnilise mumbo-jumbo
 // formsidel peab olema eraldi root POSTile js failis
 // app.use(bodyparser.urlencoded({extended: false})); võtab päringu(req) ning decodeerib selle; extended false --> andmed on ainult tekstiinfo
 // app.set('view engine', 'ejs'); --> defineerib app engine  
 // app.use(express.static('public')); ---> lubab public kataloogi kasutada
 // conn.end() -> lõpetab ühenduse db.ga
 // INSERT INTO person (first_name, last_name, birth_date) VALUES(?,?,?) --> küsimärgid ei lase teha injection type attacki nii kergelt? 
 // conn.query(sql, [req.body.firtNameInput, req.body.lastNameInput, req.body.dateOfBirth]) paneb küsimärkide asemele andmed?
 // addfilmperson --> locals.notice kui väärtus puudub, näitab tühjust
