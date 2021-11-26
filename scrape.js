const axios = require("axios");
const cheerio = require("cheerio");

// Ensure healthy input
if (process.argv.length !== 3) {
	console.error("Too many arguments");
	process.exit(1);
}
if (!process.argv[2].startsWith("https://store.line.me/stickershop/product/")) {
	console.error("Not a Line stickerpack (afaik)");
	process.exit(1);
}

// Fetch HTML for sticker sheet
const url = process.argv[2];
axios.get(url).then(res => {
	// Prepare Cheerio
	const $ = cheerio.load(res.data);
	$.html();

	// Itemize and append styles to an array
	const len = $('.mdCMN09Ul.FnStickerList').children('li').length
	console.log("Preparing " + len + " stickers...");
	let raw = [];
	const l = $('.mdCMN09Ul.FnStickerList').children('li');
	console.log($(l)[0].attribs['data-preview']);

	let i = 0;
	for (i=0;i++;i<len) {
		const attr = $(l)[i].attribs['data-preview'];
		console.log(attr);
		raw.push(attr);
	}
	console.log(raw);
});