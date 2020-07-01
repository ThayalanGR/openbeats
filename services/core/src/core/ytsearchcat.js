const axios = require('axios');

// function to perform null check on the parameters
const jsonNullCheckResponse = (parameterName, currentSongObj) => {
	try {
		switch (parameterName) {
			case "title":
				return currentSongObj["title"]["runs"][0]["text"];
			case "allSongThumbnails":
				return currentSongObj["thumbnail"]["thumbnails"];
			case "songThumbnail":
				let allSongThumbnails = currentSongObj["thumbnail"]["thumbnails"];
				return currentSongObj["thumbnail"]["thumbnails"][allSongThumbnails.length - 1]["url"];
			case "songDuration":
				return currentSongObj["lengthText"]["simpleText"];
			case "songId":
				return currentSongObj["videoId"];
			case "channelName":
				return currentSongObj["ownerText"]["runs"][0]["text"];
			case "channelId":
				return currentSongObj["ownerText"]["runs"][0]["navigationEndpoint"]["commandMetadata"]["webCommandMetadata"]["url"];
			case "uploadedOn":
				return currentSongObj["publishedTimeText"]["simpleText"];
			case "views":
				return currentSongObj["viewCountText"]["simpleText"];
			case "shortViews":
				return currentSongObj["shortViewCountText"]["simpleText"];
		}
	} catch (error) {
		return null;
	}
};

export default async (queryString, first = false) => {
	try {
		// get html response for the query
		const htmlContent = (
			await axios.get("https://www.youtube.com/results?search_query=" + queryString)
		).data;

		// compute indexes of the required json string in html document
		const index1 =
			htmlContent.indexOf(`window["ytInitialData"]`) +
			`window["ytInitialData"] = `.length;
		const index2 = htmlContent.indexOf(`window["ytInitialPlayerResponse"] = null;`) - 6;

		// convert the required string into json
		const jsonValue = await JSON.parse(htmlContent.substring(index1, index2));

		// parsing to the required array of objects
		const arrayOfResponses = jsonValue.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;

		// computing length of array (ie. number of song objects)
		const arrayOfResponsesLen = await arrayOfResponses.length;

		// holds the ytCatResponse 
		let ytCatResponse = [];

		// iterating through each song object to compile the ytCatResponse object
		for (i = 0; i < arrayOfResponsesLen; i++) {

			// getting current song object
			let currentSongObj = arrayOfResponses[i]["videoRenderer"];

			// filtering for valid video responses
			if (currentSongObj != null) {

				// getting song parameters and pushing to array
				ytCatResponse.push({
					title: jsonNullCheckResponse("title", currentSongObj),
					thumbnail: jsonNullCheckResponse("songThumbnail", currentSongObj),
					duration: jsonNullCheckResponse("songDuration", currentSongObj),
					videoId: jsonNullCheckResponse("songId", currentSongObj),
					channelName: jsonNullCheckResponse("channelName", currentSongObj),
					channelId: jsonNullCheckResponse("channelId", currentSongObj),
					uploadedOn: jsonNullCheckResponse("uploadedOn", currentSongObj),
					views: jsonNullCheckResponse("views", currentSongObj),
					extras: {
						allThumbnails: jsonNullCheckResponse("allSongThumbnails", currentSongObj),
						shortViews: jsonNullCheckResponse("shortViews", currentSongObj),
					}
				});
				// breaking loop if first is true
				if (first)
					break;
			}
		}
		return ytCatResponse;
	} catch (error) {
		return [];
	}
};