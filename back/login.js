

if (req.session.profile != undefined)
res.redirect('/')  
else if  (!req.body || (!req.body.username && !req.body.password))
res.render('pages/login')
else if (!req.body.username || !req.body.password){
    res.render('pages/login')
    console.log("empty field!")
}
else {
    var username = eschtml(req.body.username)
    var password = eschtml(req.body.password)
    conn.query('SELECT * FROM `users` WHERE username = ?', [username], function (err, result) { if (err) throw err;
    if (result.length == 0){
        res.render('pages/login',{error: "Unknow username"})
    }
    else {
        bcrypt.compare(password, result[0].password, function(err, respass) {
            if (!respass){
                res.render('pages/login',{error: "Wrong password !"})
            }
            else {
                req.session.profile = result[0]
                req.session.first = '1';
                res.redirect('/index')
            }
        })

    }
    })



}

