const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const https = require("https");
const path = require("path");

// Ensure healthy input
console.log("[INFO] Ensuring healthy input...")
if (process.argv.length !== 3) {
	console.error("[ERROR] Too many arguments");
	process.exit(1);
}
if (!process.argv[2].startsWith("https://store.line.me/stickershop/product/")) {
	console.error("[ERROR] Not a Line stickerpack (afaik)");
	process.exit(1);
}
console.log("[INFO] Input appears healthy");

// Fetch HTML for sticker sheet
const url = process.argv[2];
console.log("[INFO] Fetching sticker pack from " + url);
axios.get(url).then(res => {
	// Prepare Cheerio
	const $ = cheerio.load(res.data);
	$.html();
	console.log("[INFO] Parsing HTML");

	// Itemize and append styles to an array
	const len = $('.mdCMN09Ul.FnStickerList').children('li').length;
	console.log("Preparing " + len + " stickers...");
	let raw = [];
	const l = $('.mdCMN09Ul.FnStickerList li');

	$(l).each((i ,elm) => {
		console.log("[INFO] Adding sticker " + i + " to temporary DB")
		raw[i] = $(l).get(i).attribs['data-preview'];
	})
	console.log("[INFO] Added " + raw.length + " stickers to database of " + len + " available.");

	// Prepare new folder for sticker pack
	console.log("[INFO] Preparing new folder for sticker pack...");
	const packId = url.replace("https://store.line.me/stickershop/product/", "");
	const dir = path.resolve(process.cwd(), packId)

	// Create sticker directory
	fs.mkdir(dir, (e) => {
		if (e) throw e;
		console.log("[INFO] Created folder for sticker pack " + packId);
	});

	// Start downloading stickers
	raw.forEach((v, i) => {
		const obj = JSON.parse(raw[i]);
		const stickerUrl = obj.staticUrl;
		const stickerId = obj.id;
		https.get(stickerUrl, (res) => {
			// Fetch file extension for sticker (it varies)
			let extension;
			const contentType = res.headers['content-type'];
			if (contentType === "image/png") {
				extension = "png"
			} else if (contentType === "image/jpeg") {
				extension = "jpg"
			} else {
				console.error("[ERROR] Unexpected content-type of \"" + contentType + "\"");
			}
			
			// Pipe data to file
			const path = `${dir}/${stickerId}.${extension}`
			const str = fs.createWriteStream(path);
			res.pipe(str);
			str.on('finish', () => {
				str.close();
				console.log("[INFO] Downloaded sticker " + stickerId)
			})
		});
	});
});