function language_change(val){
    var sql = 'UPDATE users SET language = ? WHERE id = ?'
    conn.query(sql, [val, req.session.profile.id], function (err) { if (err) res.redirect('/error/SQL error ' + err); })
   req.session.profile.language = val;
}
if (req.body.lang != undefined){
	language_change(req.body.lang )
	res.redirect('/index')
}
else {


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
function render(movies, query, api) {
	if (!empty(req.body.srch) || req.session.first == '1') {
		req.session.first = 0;
		req.session.movies = movies;
		req.session.api = api;
	}


	checkforvues(movies, query, api, (cmovies) => {
		
		if (req.params.genres){
			req.session.first = 0;
		req.session.movies = movies;
		req.session.api = api;
			res.render('pages/index', { profile: req.session.profile, movies: cmovies, api: api, sort: req.body.sort, search: req.body.srch, genres: req.params.genres, rating: req.body.filtrerating, qualityk: req.body.quality, searchnav: 0, indxx: 1 })

		}
		else if (req.params.filter){
			req.session.first = 0;
			req.session.movies = movies;
			req.session.api = api;
				res.render('pages/index', { profile: req.session.profile, movies: cmovies, api: api, sort: req.params.filter, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality, searchnav: 0, indxx: 1 })
	
		}
		else if (empty(cmovies) || empty(movies))
			res.redirect('/error/No movies found')
		// else if (req.body.srch == 'yts' || req.body.srch == undefined) {
		// 	res.render('pages/index', { profile: req.session.profile, movies: cmovies, api: api, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality, yts: 2 })
		// }
		else if (empty(query))
			res.render('pages/index', { profile: req.session.profile, movies: cmovies, api: api, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality,searchnav: 0, indxx: 1 })
		
		else
			res.render('pages/index', { profile: req.session.profile, movies: cmovies, count: cmovies.length, q: query, api: api, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality, searchnav: 1, indxx: 1})
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

async function yts(query) {



	if (req.params.filter){
		var sort = eschtml(req.params.filter);
	}
	if (req.params.genres){
		var genre = eschtml(req.params.genres);
	}
	else
		var genre = "All";
	if (req.body.filtrerating)
		var minimumrating = eschtml(req.body.filtrerating);
	if (req.body.quality)
		var quality = eschtml(req.body.quality);
	if (empty(query) || query === "undefined") {
		try {
			if (!sort) { var sort = "like_count" };
			var requete = 'https://yts.mx/api/v2/list_movies.json?sort_by=' + sort + '&limit=10&page=' + number;
			if (genre != "All")
				var requete = requete + '&genre=' + genre;
			if (minimumrating)
				var requete = requete + '&minimum_rating=' + minimumrating;
			if (quality)
				var requete = requete + '&quality=' + quality;
			let fetching = await fetch(requete);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1);
		} catch (err) { res.redirect('/error/YTS catch WOULA RADINEEEEE' + err); }
	}
	else {
		var ytsquery = encodeURI(query)
		try {
			if (!sort) { var sort = "title" };
			var requete = 'https://yts.mx/api/v2/list_movies.json?query_term=' + ytsquery + '&sort_by=' + sort + '&page=' + number;
			if (genre != "All")
				var requete = requete + '&genre=' + genre;
			if (minimumrating)
				var requete = requete + '&minimum_rating=' + minimumrating;
			if (quality)
				var requete = requete + '&quality=' + quality;
			let fetching = await fetch(requete);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1)
		} catch (err) { res.redirect('/error/YTS catch ' + err); }
	}
}

async function thepiratebay(query) {
	try {
		if (empty(query) || query === "undefined") {
			var result = await PirateBay.topTorrents(200)
		}
		else {
			var result = await PirateBay.search(query, {
				category: 'video',
				orderBy: 'name',
				sortBy: 'desc',
				filter: { verified: true }
			})
		}
		const piratemovies = result.map(elem => {
			elem.name = elem.name.replace(/\./g, ' ');
			return ({
				id: elem.id,
				title: elem.name,
				uploaddate: elem.uploadDate,
				size: elem.size,
				link: elem.link,
				category: elem.subcategory.name,
				magnet: elem.magnetLink,
				cover: 'img/thepiratebay.png'
			})
		});
		render(piratemovies, query, 2)
	} catch (err) { res.redirect('/error/TPB catch ' + err); }
}

async function katorrent(query) {

	try {

		if (empty(query) || query === 'undefined') {
			var result = await kat.getMovies({
				field: kat.Options.Fields.Seed,
				order: kat.Options.Order.Descending
			})
		}
		else {
			var result = await kat.advanceSearch(query)
		}
		const katmovies = result.results.map(elem => {

			return ({
				title: elem.title,
				size: elem.size,
				magnet: elem['Download magnet link'],
				category: elem.posted_in,
				cover: 'img/kattorrent.png',
				time: elem.time
			})
		});
		render(katmovies, query, 4)
	} catch (err) { console.log("ERROR torrent") }
}



var query = eschtml(req.body.query)
var number = req.body.number;
if (number === undefined)
	number = 1;
// if (req.body.sort == undefined && req.body.genres == undefined && req.body.quality == undefined && req.body.filtrerating == undefined)
// 	req.body.sort = 1;
switch (req.body.srch) {
	case 'kat':
		katorrent(query)
		break;
	case 'tpb':
		thepiratebay(query);
		break;
	case 'yts':
		isReachable('https://yts.mx/api/v2/list_movies.json', { timeout: 3000 }).then(r => {
			if (r == true)
				yts(query, number);
			else
				res.redirect('/error/YTS is momentarily down, please try again later');
		})
		break;
	default:
		isReachable('https://yts.mx/api/v2/list_movies.json', { timeout: 3000 }).then(r => {
			if (r == true)
				yts(query);
			else
				thepiratebay(query);
		})
}


}
