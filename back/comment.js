

console.log(req.body)
var comment = req.body.comment;
var movie_id = req.body.movie_id;
sql = "INSERT INTO comments (`user_id`,`user_login`,`movie_id`,`comment`) VALUES(?,?,?,?)"
conn.query(sql,[req.session.profile.id,req.session.profile.username,movie_id,comment],function(err){
    if (err) {throw err; res.redirect('/error/SQL error ' + err);}
})