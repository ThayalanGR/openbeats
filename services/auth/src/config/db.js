import mongoose from "mongoose";
import config from "config";

export default async () => {
	let mongoUrl = "";
	if (config.get("isDev")) {
		mongoUrl = config.get("mongoURI_DEV");
	} else {
		mongoUrl = process.env.DB;
	}
	await mongoose
		.connect(mongoUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		})
		.then(() => {
			console.log("Mongo db connection Successful!");
		})
		.catch(err => console.error("Mongo db connection failed!", err.message));
};