import Artist from "../models/Artist";
import Album from "../models/Album";
import { Router } from "express";
import { check, oneOf, validationResult } from "express-validator";
import paginationMiddleware from "../config/paginationMiddleware";
import { saveAsserts, deleteAssert } from "../core/digitalOceanSpaces";
import { canDeleteArtist, canUpdateArtist } from "../permissions/artist";

const router = Router();

//artist creation
router.post("/create", async (req, res) => {
	try {
		const { name, thumbnail } = req.body;
		if (!name) {
			throw new Error("name is required.");
		}
		const artist = new Artist({
			name,
			thumbnail,
		});
		await artist.save();
		saveAsserts("artists", artist._id, thumbnail, Artist, "thumbnail");
		res.send({
			status: true,
			data: artist,
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

//Get artist by Id or startsWith
router.get("/fetch", oneOf([check("tagId").exists(), check("query").exists()]), async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json({
				status: false,
				data: "Please provide either artistId or query as query params.",
			});
		}
		const { tagId, query } = req.query;

		if (tagId) {
			const artist = await Artist.findById(tagId);
			return res.send({
				status: true,
				data: artist,
			});
		} else if (query) {
			const artists = await Artist.find(
				{
					$text: {
						$search: `${query}`,
						$caseSensitive: false,
					},
				},
				{
					score: {
						$meta: "textScore",
					},
				}
			).sort({ score: { $meta: "textScore" } });
			return res.send({
				status: true,
				data: artists,
			});
		}
		return res.send({
			status: false,
			data: [],
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

router.get("/suggest", async (req, res) => {
	try {
		const { query } = req.query;
		const artists = await Artist.find({ name: { $regex: `${query}`, $options: `i` } }).limit(5);
		return res.send({
			status: true,
			data: artists,
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

//Get all artist (page and limit query param is required)
router.get("/all", paginationMiddleware(Artist), async (req, res) => {
	try {
		if (res.pagnationError) throw new Error(res.pagnationError);
		res.send({
			status: true,
			data: res.paginatedResults,
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

//update artist
router.put("/:id", canUpdateArtist, async (req, res) => {
	try {
		const { name, thumbnail } = req.body;
		if (!name) {
			throw new Error("Name is required.");
		}
		req.artist.name = name;
		if (thumbnail) {
			req.artist.thumbnail = thumbnail;
			saveAsserts("artists", req.artist._id, thumbnail, Artist, "thumbnail");
		}
		await req.artist.save();
		return res.send({
			status: true,
			data: req.artist,
		});
	} catch (error) {
		console.log(error.message);
		return res.send({
			status: false,
			data: error.message,
		});
	}
});

//delete artist
router.delete("/:id", canDeleteArtist, async (req, res) => {
	try {
		const artist = await Artist.findById(req.params.id);
		deleteAssert(artist.thumbnail);
		Artist.deleteOne({ _id: req.params.id });
		res.send({
			status: true,
			data: "Artist got deleted successfully.",
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

// fetch artist specific albums..
router.get("/:id/releases", async (req, res) => {
	try {
		const releasedAlbum = await Album.find(
			{
				albumBy: req.params.id,
			},
			{
				_id: true,
				name: 1,
				thumbnail: 2,
				totalSongs: 3,
				albumBy: 4,
			}
		).populate("albumBy");
		setTimeout(async () => {
			const artist = await Artist.findById(req.params.id);
			if (typeof artist.popularityCount === "number") {
				artist.popularityCount += 1;
			} else {
				artist.popularityCount = 1;
			}
			artist.save();
		}, 0);
		return res.send({
			status: true,
			data: releasedAlbum,
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

// fetch artist featuring albums..
router.get("/:id/featuring", async (req, res) => {
	try {
		const featuringAlbum = await Album.find(
			{
				featuringArtists: {
					$in: [req.params.id],
				},
			},
			{
				_id: true,
				name: 1,
				thumbnail: 2,
				totalSongs: 3,
			}
		);
		setTimeout(async () => {
			const artist = await Artist.findById(req.params.id);
			if (typeof artist.popularityCount === "number") {
				artist.popularityCount += 1;
			} else {
				artist.popularityCount = 1;
			}
			artist.save();
		}, 0);
		res.send({
			status: true,
			data: featuringAlbum,
		});
	} catch (error) {
		console.log(error.message);
		res.send({
			status: false,
			data: error.message,
		});
	}
});

export default router;
