

console.log("Salut  c moi")
var form = new formidable.IncomingForm();
form.parse(req, function (err, field, files) {
    if (err) { res.redirect('/error/form.parse error in register.js ' + err); }
    else {
        if (req.session.profile != undefined)
            res.render('pages/index', { profile: req.session })
        else if (!field || (!field.username && !field.name && !field.firstname && !field.email && !field.password && !files.pic))
            res.render('pages/register')
        else if (!field.username || !field.name || !field.firstname || !field.email || !field.password || !files.pic)
            console.log('You must fill in every field to create an account')
        else if (files.pic.type !== 'image/png' && files.pic.type !== 'image/jpeg' && files.pic.type !== 'image/jpg')
            console.log('Only jpeg, jpg, and png images aloud')
        else if (files.pic.size > 5000000)
            console.log('Your image is too big')
        else {
            var username = eschtml(field.username)
            var firstname = eschtml(field.firstname)
            var name = eschtml(field.name)
            var email = eschtml(field.email)
            var password = eschtml(field.password)
            regLow = /[a-z]/;
            regUp = /[A-Z]/;
            if (password.lenght < 5 || password.search(regLow) == -1 || password.search(regUp) == -1)
                res.render('pages/register',{error: "Password must be minimum 6 characters long and must contain an uppercase and a lowercase"})
            else if (!validator.isEmail(email))
                res.render('pages/register',{error: "email is not valid"})
            else {
                conn.query("SELECT username FROM users WHERE (username = ? OR email = ?) AND api = 1 ", [username, email], function (err, result) { if (err) throw err
                    if (result.length != 0)
                        res.render('pages/register',{error: "username or email is already used"})
                    else {
                        conn.query('SELECT id FROM `users` ORDER BY id DESC LIMIT 1', function (err, resid) {if (err) throw err;
                            if (resid.length == 0)
                                var dirid = '1';
                            else
                                var dirid = resid[0].id + 1;
                            var path = 'public/img/users/' + dirid;
                            fs.readFile(files.pic.path, function (err, data) {if (err) throw err;
                                fs.writeFile(path, data, function (err) { if (err) throw err; })
                            })
                            bcrypt.hash(password, 10, function (err, hash) {
                                if (err) throw err
                                sql = "INSERT INTO users (username, firstname, name, email, password, img, api) VALUES(?,?,?,?,?,?, 1)"
                                conn.query(sql, [username, firstname, name, email, hash, '/img/users/'+ dirid], function (err, res) { if (err) throw err })
                            })
                            res.render('pages/login')
                        })
                    }
                })
            }
        }
    }
})

