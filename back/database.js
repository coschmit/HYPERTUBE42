conn.query('CREATE DATABASE IF NOT EXISTS `hypertube`', function (err) { if (err) throw err })
conn.query('USE `hypertube`', function (err) { if (err) throw err })
var users = `CREATE TABLE IF NOT EXISTS users ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    username VARCHAR(255), \
    firstname VARCHAR(255),
    name VARCHAR(255), \
    email VARCHAR(255),\
    password VARCHAR(255), \
    img VARCHAR(255), \
    api INT, \
    language VARCHAR(255) DEFAULT 'en' )`;
conn.query(users, function (err, res) { if (err) throw err })


var vues = 'CREATE TABLE IF NOT EXISTS vues (\
    id INT AUTO_INCREMENT PRIMARY KEY, \
    user_id INT, \
    movie_id INT)';
conn.query(vues, function (err) { if (err) throw err });

var movies = 'CREATE TABLE IF NOT EXISTS movies ( \
        id INT AUTO_INCREMENT PRIMARY KEY, \
        hash TEXT, path VARCHAR(255), \
        title TEXT, api_id VARCHAR(255), api INT,state INT, last DATETIME)';
conn.query(movies, (err) => { if (err) res.redirect('/error/SQL error ' + err); });

var comments = 'CREATE TABLE IF NOT EXISTS comments (\
    id INT AUTO_INCREMENT PRIMARY KEY, \
    user_id INT, \
    user_login VARCHAR(255), \
    movie_id INT, \
    comment TEXT)';
    conn.query(comments, (err) => {if (err) res.redirect('/error/SQL error ' + err);});