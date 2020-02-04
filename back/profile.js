console.log("PIPIIIIIIIIII")
console.log(req.body)
console.log(req.session.profile[username])

function language_change(val){
    var sql = 'UPDATE users SET language = ? WHERE id = ?'
    conn.query(sql, [val, req.session.profile.id], function (err) { if (err) res.redirect('/error/SQL error ' + err); })
   req.session.profile.language = val;
}

//language_change(req.body.language_toggle)


