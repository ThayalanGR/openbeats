import 'dotenv/config';
import middleware from './config/middleware';
import dbconfig from './config/db';
import express from 'express';
import copycat from './core/copycat'

const app = express();

middleware(app);
dbconfig();


app.get("/", (req, res) => {
    res.send("Welcome to OpenBeats!\n Enjoy Unlimited music for free! ")
})

app.get("/opencc/:id", async (req, res) => {
    let link = `https://www.youtube.com/watch?v=${req.params.id}`
    let ccLink = await copycat(link)
    res.send({
        'status': true,
        'link': ccLink
    });
})

app.listen(process.env.PORT, () => {
    console.log("openbeats server up and running on port :", process.env.PORT);
})
