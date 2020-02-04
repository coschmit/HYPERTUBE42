function updateuser(column, change) {
    if (req.session.profile.api !== 1) {

            error = ' You can\'t update your preference whilst not using a local account'
            return;

    }
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    conn.query(sql, [change, req.session.profile.id], function (err) { if (err) res.redirect('/error/SQL error ' + err); })
    req.session.profile[column] = change;
    update = 1;
}

var error = '';
update = 0;
if (!req.session || !req.session.profile)
    res.redirect('/')

else {
    req.i18n.setLocale(req.session.profile.language);

    var form = new formidable.IncomingForm();
    form.parse(req, function (err1, field, files) {
        if (err1) res.redirect('/error/form.parse in my_profile.js ' + err1);;

        if (empty(field) && empty(files))
            res.render('pages/account', { profile: req.session.profile })
        else {
            if (!empty(field.firstname))
                updateuser('firstname', eschtml(field.firstname))
            if (!empty(field.name))
                updateuser('name', eschtml(field.name))
            if (!empty(field.password) && error === '') {

                var regLow = /[a-z]/; var regUp = /[A-Z]/;
                if (field.password.length < 5 || field.password.search(regLow) == -1 || field.password.search(regUp) == -1)
                    error += ' Password must be minimum 6 characters long and must contain an uppercase and a lowercase';
                else {
                    bcrypt.hash(eschtml(field.password), 10, (err, hash) => {
                        if (err) res.redirect('/error/SQL error ' + err);
                        updateuser('password', hash)
                    })
                }
            }
            if (files.pic.size !== 0 && error === '' && req.session.profile.api == 1)
        {
            if (files.pic.type !== 'image/png' && files.pic.type !== 'image/jpeg' && files.pic.type !== 'image/jpg') {
                error += ' File must be .png, .jpeg, or .jpg'; }
            else if (files.pic.size > 5000000) {
                error += ' File is too big'; }
            else {
                fs.readFile(files.pic.path, (err, data) => { if (err) res.redirect('/error/readFile error ' + err); 
                    fs.writeFile('public/img/users/' + req.session.profile.id, data, (err) => { if (err) res.redirect('/error/writeFile error ' + err); }) });
                updateuser('img', '/img/users/' + req.session.profile.id) }
        }
        if (!empty(field.username) && error === '') {
            wait.for.promise(new Promise((resolve) => {
                conn.query('SELECT id FROM users WHERE username = ?', [eschtml(field.login)], (err, result) => { if (err) res.redirect('/error/SQL error ' + err);
                    if (result.length == 0) 
                        updateuser('username', eschtml(field.username)) 
                    else { 
                        error += ' Username already exists in database'; } 
                    resolve(); })
            }) );
        }
        if (!empty(field.email) && error === '') {
            if (!validator.isEmail(field.email))  
                error += ' E-mail is not valid'; 
            else {
                wait.for.promise(new Promise((resolve) => {
                    conn.query('SELECT id FROM users WHERE email = ?', [eschtml(field.email)], (err, result) => { if (err) res.redirect('/error/SQL error ' + err);
                    if (result.length == 0) 
                    updateuser('email', eschtml(field.email)) 
                    else { 
                        error += ' Email already exists in database'; } 
                    resolve(); })
                }))
            }
        }
        if (req.session.profile.api !== 1 && error === '' && files.pic.size !== 0)
            res.render('pages/account', {error: 'You can only update your language preference whilst not using a local account', profile: req.session.profile})
        else if (update == 0 && error === '')
            res.render('pages/account', {error: 'You must input something to update', profile: req.session.profile})
        else if (error === '')
            res.render('pages/account', {success: 'Your profile was successfully updated', profile: req.session.profile})
        else
            res.render('pages/account', {error: error, profile: req.session.profile})
    
        }

    })
}