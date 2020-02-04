if (req.params.hash !== undefined)
{
    
    hash = req.params.hash;
    console.log(hash)
	const getEngineFile = function(engine) {
		return new Promise ((resolve, reject) => {
			engine.on('ready', async() => {
				await engine.files.forEach((file, id) => {
					if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
						file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
					{
						resolve(file);
					}
				});
				reject('Error');;
			});
		});
	}
	async function tsStart(hash) {
		return (await torrentStream(hash, {
			tmp: __dirname + '/tmp/upload',
			path: __dirname + '/tmp/films/'}))
	}
	function checkRange(file, rangeHeader, res) {
		const ranges = rangeParser(file.length, rangeHeader, {combine: true});
		if (ranges === -1)
			return (-1);
		else if (ranges === -2 || ranges.type !== 'bytes' || ranges.length > 1)
			return (0);
		else
			return (ranges[0]);
	}
	function checkStream(file, ranges, res) {
		if (ranges === -1) {
			res.statusCode = 416;
			return (false);
		}
		else if (ranges === 0) {
			var convert = null;
			if (file.name.substr(file.name.length - 3) == 'avi')
			{
				var convert = ffmpeg(file.createReadStream())
								.videoCodec('libvpx')
								.audioCodec('libvorbis')
								.videoBitrate('512k')
								.format('webm')
								.outputOptions([
									'-deadline realtime',
									'-error-resilient 1'
								])
								.on('error', (err) => {
									;
                                })
                                console.log("NORMALOMENT C CONVERT")
			}
			res.setHeader('Content-Length', file.length);
			if (convert != null)
				pump(convert, res);
			else
				pump(file.createReadStream(), res);
		}
		else {
			var convert = null;
			if (file.name.substr(file.name.length - 3) == 'avi')
			{
				var convert = ffmpeg(file.createReadStream({start: ranges.start, end: ranges.end}))
								.videoCodec('libvpx')
								.audioCodec('libvorbis')
								.videoBitrate('512k')
								.format('webm')
								.outputOptions([
									'-deadline realtime',
									'-error-resilient 1'
								])
								.on('error', (err) => {
									;
                                })
                                console.log("OK C CONVERT")
			}
			res.statusCode = 206;
			res.setHeader('Content-Length', 1 + ranges.end - ranges.start);
			res.setHeader('Content-Range', `bytes ${ranges.start}-${ranges.end}/${file.length}`);
			if(convert != null)
				pump(convert, res);
			else
				pump(file.createReadStream({start: ranges.start, end: ranges.end}), res);
		}
		return (true);
	}
	const ranger = req.headers.range;
	const ts = tsStart(hash);
	res.setHeader('Accept-Ranges', 'bytes');
	ts
		.then((engine) => {
			const torrentFile = getEngineFile(engine);
			torrentFile
				.then(async(file) => {
					pathing = '/tmp/films/'+file.path;
					conn.query('UPDATE movies SET path = ? WHERE hash = ?', [pathing, hash], (err) => {
						if (err) throw (err);
					})
					res.setHeader('Content-Type', `video/mp4`);
					const ranges = await checkRange(file, ranger, res);
					if (!checkStream(file, ranges, res)) {
						return (res.end());
					}
				})
				.catch(err => {
					console.log(err);
				})
		})
		.catch(err => {
			console.log(err);
		})
}