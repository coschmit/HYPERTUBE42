function checkforvues(movies, query, api, callback) {
	conn.query('SELECT * FROM vues WHERE user_id = ?', [req.session.profile.id], (err, vueresult) => {
		if (err) { res.redirect('/error/SQL vue problem in search.js 1 ' + err); }
		if (vueresult.length == 0)
			return callback(movies)
		var ids = new Array;
		var i = 0;
		movieids = vueresult.map(el => {
			if (!ids.includes(el.movie_id)) {
				ids[i] = el.movie_id;
				i++;
				return el.movie_id
			}
			else
				return null;
		}).filter(el => {
			if (el == null)
				return false
			else
				return true
		})
		conn.query('SELECT * FROM movies WHERE id IN (?) AND api = ?', [movieids, api], (err, seenmovies) => {
			if (err) { res.redirect('/error/SQL vue problem in search.js 2 ' + err); }
			if (seenmovies == undefined || movies == undefined)
				return callback(movies)
			movies.forEach(movie => {
				seenmovies.forEach(s => {
					if ((s.api_id == movie.id && !empty(movie.id) && !empty(s.api_id)) ||
						(s.title == movie.title && !empty(s.title) && !empty(movie.title)))
						movie.vue = 1

				})
			})
			return callback(movies)
		})
	})
}

function render(movies, query, api, number) {
	if (req.session.movies[req.session.movies.length - 1].id != movies[movies.length - 1].id)
		req.session.movies = req.session.movies.concat(movies);
	checkforvues(movies, query, api, (cmovies) => {
		if (empty(cmovies) || empty(movies))
			res.redirect('/error/No movies found')
		else if (empty(query)) {
			res.json({
				status: 1,
				code: 200,
				type: 'success',
				data: {
					profile: req.session.profile, movies: cmovies, count: cmovies.length, q: query, api, number: number, sort: req.body.sort, search: req.body.srch, genres: req.body.genre, rating: req.body.filtrerating, qualityk: req.body.quality
				}
			})
		}
		else
			res.render('pages/index', { profile: req.session.profile, movies: cmovies, count: cmovies.length, q: query, api: api, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality })

	})
}

function mapyts(data) {
	if (data.movie_count != 0) {
		var movies = data.movies.map(elem => {
			if (elem.large_cover_image)
				var cover = elem.large_cover_image;
			else
				var cover = elem.medium_cover_image;
			return ({
				id: elem.id,
				title: elem.title,
				year: elem.year,
				rating: elem.rating,
				genres: elem.genres,
				synopsis: elem.synopsis,
				language: elem.language,
				cover: cover,
				background: elem.background_image,
				runtime: elem.runtime,
				torrents: elem.torrents
			})
		})
	}
	return (movies)
}


async function yts(query, number) {

		var sort = eschtml(req.body.sort);
	if (req.body.genres)
		var genre = eschtml(req.body.genres);
	else if (req.params.genres)
		var genre = eschtml(req.params.genres);
	else
		var genre = "All";
	if (req.body.filtrerating)
		var minimumrating = eschtml(req.body.filtrerating);
	if (req.body.quality)
		var quality = eschtml(req.body.quality);
	if (empty(query) || query === "undefined") {
		try {
			if (!sort) { var sort = "like_count" };
			var requete = 'https://yts.am/api/v2/list_movies.json?sort_by=' + sort + '&limit=10&page=' + number;
			if (genre != "All")
				var requete = requete + '&genre=' + genre;
			if (minimumrating)
				var requete = requete + '&minimum_rating=' + minimumrating;
			if (quality)
				var requete = requete + '&quality=' + quality;
			let fetching = await fetch(requete);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1, number);
		} catch (err) { res.redirect('/error/YTS catch' + err); }
	}
	else {
		var ytsquery = encodeURI(query)
		try {
			if (!sort) { var sort = "title" };
			var requete = 'https://yts.mx/api/v2/list_movies.json?query_term=' + ytsquery + '&sort_by=' + sort + '&limit=10&page=' + number;
			if (genre != "All")
				var requete = requete + '&genre=' + genre;
			if (minimumrating)
				var requete = requete + '&minimum_rating=' + minimumrating;
			if (quality)
				var requete = requete + '&quality=' + quality;
			let fetching = await fetch(requete);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1, number)
		} catch (err) { res.redirect('/error/YTS catch ' + err); }
	}
}

var query = eschtml(req.body.query)
var number = eschtml(req.body.number);
if (req.body.srch == undefined)
	req.body.srch = 'yts';
if (req.body.sort == undefined && req.body.genres == undefined && req.body.quality == undefined && req.body.filtrerating == undefined)
	req.body.sort = 1;
isReachable('https://yts.mx/api/v2/list_movies.json', { timeout: 2000 }).then(r => {
	if (r == true)
		yts(query, number);
	else
		res.redirect('/error/YTS is momentarily down, please try again later');
})

