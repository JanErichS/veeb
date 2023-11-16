const express = require('express'); 
const fs = require('fs');
const app = express(); 
const mysql = require('mysql2');
const bodyparser = require('body-parser');
const multer = require('multer')
const sharp = require('sharp');
// vahevara seadistus
const upload = multer({dest: './public/upload/orig/'});

// isetehtud moodulid
const dateTime = require('./dateTime_ET');
const dbInfo = require('../../vp23config');
const { timeStamp } = require('console');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));

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

// ühe filmi "esileht"
app.get('/movies/singlemovie', (req, res)=>{
    let sql = 'SELECT id FROM movie';
    conn.query(sql, (err, result)=>{
        if (err){
            throw err;
        }
        else{
            res.render('singlemovie', {movieNum: result})
        }
    });
});

// UUDISED
// avaleht
app.get('/news', (req, res)=>{
    res.render('news');
});

// uudiste lugemine
app.get('/news/read', (req, res)=>{
    let sql = 'SELECT id, title FROM vp_news WHERE expire > '+ dateTime.dateSql() +' AND deleted IS NULL ORDER BY id DESC';
    conn.query(sql, (err, result)=>{
        if (err){
            throw err;
        }
        else{
            res.render('readnews', {newsList: result})
        }
    });
});

// uudise lugemine läbi id
app.get('/news/read/:id', (req, res)=>{
    let sql = 'SELECT title, content, UNIX_TIMESTAMP(added) AS `time` FROM vp_news WHERE id=?';
    let notice = ''
    conn.query(sql, [req.params.id], (err, result)=> {
        if (err){
            notice = 'Midagi läks valesti!\n Proovi uuesti!'
            res.render('readnewsbyid', {notice:notice})
            throw err;
        }
        else {
            let date = result[0].time;
            date = dateTime.dateTimeSql(date)
            res.render('readnewsbyid', {news:result, time:date})
        }
    });
});

// uudise lugemine (valik läbi id+keele)
/*app.get('/news/read/:id/:lang', (req, res)=>{
    console.log(req.query);
    res.send('Tahame uudist, mille id on: ' + req.params.id + ' Ja mille keel on: ' + req.params.lang);
});*/

// uudise lisamine
app.get('/news/add', (req, res)=>{
    res.render('addnews');
});

app.get('/photoupload', (req, res)=>{
    res.render('photoupload')
});

app.get('/photogallery', (req,res)=>{
    res.render('photogallery')
});

// funktsioonid
function openArr(bigArr){
    bigArr.pop(); // eemaldab viimase tühja elemendi
    smolArr = bigArr.toString(); // muudab array tagasi stringiks
    bigArr = smolArr.split(','); // loob stringist uue array, ilma komadetta --> väga ebaefektiivne.
    return bigArr
};

// FILMI ROOTING
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

// Ühe filmi päring db-st
app.post('/movies/singlemovie', (req, res)=>{
    let sql = 'SELECT title, duration, production_year FROM movie WHERE id=?';
    conn.query(sql, [req.body.singleMovieInput], (err, result)=>{
        if (err){
            res.render('singlemovie');
            throw err;
        }
        else{
            res.render('singlemovie', {movieNum: result});
        }
    });
});

// UUDISE POST
// uudise lisamine
app.post('/news/add', (req,res)=>{
    let sql = 'INSERT INTO vp_news (id, title, content, expire, userid) VALUES(NULL,?,?,?,1)';
    let confirmation = '';
    conn.query(sql, [req.body.newsTitleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
        if (err){
            confirmation = 'Tekkis viga (bad ending; check console)';
            res.render('addnews', {confirmation:confirmation});
            throw err;
        }
        else{
            confirmation = 'Uudis pealkirjaga: "' + req.body.newsTitleInput + '" sai salvestatud!';
            res.render('addnews', {confirmation:confirmation});
        }
    });
});


// PILDID
// pildi üleslaadimine
app.post('/photoupload', upload.single('photoInput'), (req,res)=>{
    const fileRename = 'vp_' + Date.now() + '.jpg'; // paneb jõuga failinimeks: vp_millisekundid.üleslaadimishetkel.jpg; kuna väärtus muutub ainult 1 kord, sellep constant
    fs.rename(req.file.path, './public/upload/orig/' + fileRename, (err)=>{
        if (err){
            console.log('Faili laadimise viga!' + err);
        }
    });
    // Kaks väiksema mõõduga pildivarianti
    sharp('./public/upload/orig/' + fileRename).resize(100,100).jpeg({quality: 90}).toFile('./public/upload/thumbs/' + fileRename);
    sharp('./public/upload/orig/' + fileRename).resize(800,600).jpeg({quality: 90}).toFile('./public/upload/normal/' + fileRename);

    // foto andmed DB-sse
    let sql = 'INSERT INTO vpgallery (filename, originalename, alttext, privacy, userid) VALUES(?,?,?,?,?)'
    const userid = 1;
    let notice = '';
    conn.query(sql, [fileRename, req.file.originalname, req.body.altInput, req.body.privacyInput, userid], (err, result)=>{
        if (err){
            notice = 'Pildiandmete salvestamine ebaõnnestus';
            res.render('photoupload', {notice:notice});
            throw err;
        }
        else{
            notice = 'Pildi "' + req.file.originalname + '" salvestamine õnnestus';
            res.render('photoupload', {notice: notice});
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

 // NB! app.use(bodyparser.urlencoded({extended: false})); ----> FALSE ainult kui tekst ning kui tekst + midagi, siis TRUE

 //     conn.query(sql, (err, result, fields) --> fields annab tehnilise mumbo-jumbo
 // formsidel peab olema eraldi root POSTile js failis
 // app.use(bodyparser.urlencoded({extended: false})); võtab päringu(req) ning decodeerib selle; extended false --> andmed on ainult tekstiinfo
 // app.set('view engine', 'ejs'); --> defineerib app engine; laseb panna nt response.render('index') ilma faililaiendit defineerimata.
 // app.use(express.static('public')); ---> lubab public kataloogi kasutada
 // conn.end() -> lõpetab ühenduse db.ga
 // INSERT INTO person (first_name, last_name, birth_date) VALUES(?,?,?) --> küsimärgid ei lase teha injection type attacki nii kergelt? 
 // conn.query(sql, [req.body.firtNameInput, req.body.lastNameInput, req.body.dateOfBirth]) paneb küsimärkide asemele andmed?
 // addfilmperson --> locals.notice kui väärtus puudub, näitab tühjust
 // posti lahtiarutamiseks oleks hea kasutada body parserit --> teeb lihtsamaks


 // multer lisamoodul --> middleman failide salvestamiseks

 // html commentid
 // <!-- cols="mingi number" mitu tähemärki võib olla igal real.; maxlenght="mingi number" palju võib tähemärke kokku olla.-->
 // hmtl id alati ainulaadne; name "saadab" js failile

