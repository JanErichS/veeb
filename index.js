const express = require('express'); 
const app = express(); 

app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/test',(req,res)=>{
    res.send('test test 1 2 3');
});

app.listen(5133);

// comments
// Express.js framework
 // võib teha ka res.download('index.js'); -> laeb veebilehe alla; res -> response/vaste, req -> request/päring
 // app -> standard jälle
 // res.send -> saadab lihtsalt koodi enda
 // res. render -> võtab html koodi
 // ejs mooduli sai -> npm install ejs; index peab ümber nimetama .ejs extensioninga