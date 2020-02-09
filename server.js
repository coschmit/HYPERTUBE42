var express = require('express')
var app = express()
var http = require("http")
var server = http.createServer(app)
var session = require('express-session')
var mysql = require('mysql')
var bodyParser = require('body-parser')
fs = require('fs')
var i18n = require('i18n-2')
var formidable = require('formidable')
var eschtml = require('htmlspecialchars')
var bcrypt = require('bcrypt')
var validator = require('validator')
var request = require('request');
var MemoryStore = require('session-memory-store')(session);
var isReachable = require('is-reachable');
var empty = require('is-empty');
var fetch = require('node-fetch');
var PirateBay = require('thepiratebay');
var kat = require('kickass-torrent-api');
OS = require('opensubtitles-api');
wait = require('wait-for-stuff');
var path = require('path')
OpenSubtitles = new OS({ useragent: 'TemporaryUserAgent' });
axios = require('axios');
Readable = require('stream').Readable;
srtToVtt = require('srt-to-vtt');
torrentStream = require('torrent-stream');
rangeParser = require('range-parser');
pump = require('pump');
ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
parseTorrent = require('parse-torrent');
var mailer = require("nodemailer")
var rand = require("random-key")




// DATABASE
var conn = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "pass1234"
})
conn.connect(function (err) {
    if (err) throw err
    eval(fs.readFileSync(__dirname + "/back/database.js") + '')
})

server.listen(8888)

app.set('view engine', 'ejs')


//Middleware

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'))
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));
app.use(express.json());
app.use(bodyParser.json());
app.use(session({
    store: new MemoryStore(),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))


i18n.expressBind(app, {
    locales: ['en', 'fr'],
    defaultLocale: 'en'
});


app.use((req, res, next) => {
    conn.query('SELECT path FROM movies WHERE last < NOW() - INTERVAL 1 MONTH', (err, rows) => {
        if (err) throw err;
        if (rows[0])
        {
            rows.forEach(elem => {
                fs.unlink(elem.path);
            })
        }
        conn.query('DELETE FROM movies WHERE last < NOW() - INTERVAL 1 MONTH', (err) => {
            if (err) throw err;
        });
    })

    if (req.session && req.session.profile)
    {

        if (empty(req.session.profile.id)) {
            conn.query('SELECT * FROM users WHERE username = ? AND api = ?', [req.session.profile.username, req.session.profile.api], 
                (err, result) => {  if (err) throw err;
                req.session.profile.id = result[0].id; 
                if (result[0].language !== 0)
                {
                    req.session.profile.language = result[0].language
                    req.i18n.setLocale(req.session.profile.language);
                }
                next();
            })
        }
        else if (!empty(req.session.profile.language))
        {
            req.i18n.setLocale(req.session.profile.language);
            next();
        }
        else
            next();
    }
    else
        next();


    

})


app.get('/', function (req, res) {


    if (req.session.profile == undefined)
        res.render('pages/login')
    else
        res.redirect('/index')
})

    .all('/index', function (req, res) {
        eval(fs.readFileSync(__dirname + "/back/index.js") + '')
    })
    .get('/index/genre/:genres', function (req, res) {
        eval(fs.readFileSync(__dirname + "/back/index.js") + '')
    })
    .get('/index/filter/:filter', function (req, res) {
        eval(fs.readFileSync(__dirname + "/back/index.js") + '')
    })
    .get('/logout', function (req, res) {
        req.session.destroy(); req.session = 0; res.redirect('/');
    })
    .all('/login', function (req, res) {

        eval(fs.readFileSync(__dirname + "/back/login.js") + '')
    })
    .all('/register', function (req, res) {
        eval(fs.readFileSync(__dirname + "/back/register.js") + '')
    })

    .post('/movie', (req, res) => {
        eval(fs.readFileSync(__dirname + "/back/movie.js") + '')
    })
    .get('/video/:hash', async (req, res) => {
        eval(fs.readFileSync(__dirname + "/back/video.js") + '')
    })
    .get('/oauthgit', function (req, res) {
        req.i18n.setLocale('fr');
        eval(fs.readFileSync(__dirname + "/back/oauthgit.js") + '')
    })
    .get('/oauth42', function (req, res) {
        eval(fs.readFileSync(__dirname + "/back/oauth42.js") + '')
    })
    .post('/index2',  function (req, res) {
        eval(fs.readFileSync(__dirname + "/back/index2.js") + '')

    })
    .all('/account',function (req,res){
        eval(fs.readFileSync(__dirname + "/back/account.js") + '')
    })
    .get('/others_profiles', function (req, res) {
        conn.query('SELECT * FROM users WHERE (id <> ?) ORDER BY id DESC', [req.session.profile.id, req.session.profile.api],
       function (err, result) {
        res.render('pages/others_profiles',{profile: req.session.profile, users: result})})
    })

    .get('/forget_password', function (req, res) {
        if (req.session.profile == undefined) {
            res.render('pages/forget_password')
        }
        else {
            res.redirect('/profile')
        }
    })
    .post('/forget_password',function(req, res){
        eval(fs.readFileSync(__dirname + "/back/forget_password.js" ) + '')
    })
    .post('/comment',function(req,res){
        eval(fs.readFileSync(__dirname +'/back/comment.js') + '')
    })
    .get("/error/:error",function(req, res){
        var error = eschtml(req.params.error)
        if (req.session.profile == undefined)
            res.render('pages/login');
        else {
            res.render("pages/error",{profile: req.session.profile, error: error})
        }
    })
    .get('*', function (req, res) {
        res.redirect('/')
    })

 