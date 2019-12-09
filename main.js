require("dotenv").config();
const Apify = require("apify");
const moment = require("moment");
const MongoClient = require("mongodb").MongoClient;
const request = require("request");
const requestPromise = require(`request-promise`);

//list global variables

Apify.main(async () => {
    const uri = process.env.DB_CONNECT;
    let mongoConnection = await MongoClient(uri, { useNewUrlParser: true });
    mongoConnection.connect(err => {
        const collection = mongoConnection.db("test").collection("devices");
        // perform actions on the collection object
    });
    const requestQueue = await Apify.openRequestQueue();

    for (i = 0; i < 7; i++) {
        await requestQueue.addRequest({
            url: `https://us.forums.blizzard.com/en/wow/c/wow-classic/l/latest.json?page=${i}`,
            userData: { requestType: "getID" }
        });
    }

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction: async ({ page, request }) => {
            let scrapedJson;
            if (request.userData.requestType === "getID") {
                try {
                    scrapedJson = JSON.parse(
                        await page.$eval(`body`, el => el.innerText)
                    );
                } catch (e) {
                    console.log(`JSON Failure: ${e}`);
                }

                for (i = 0; i < scrapedJson.topic_list.topics.length; i++) {
                    let forumPostURL = `https://us.forums.blizzard.com/en/wow/t/${scrapedJson.topic_list.topics[i].id}`;
                    await requestQueue.addRequest({
                        url: `${forumPostURL}.json?track_visit=false`,
                        userData: { requestType: "getForumData" }
                    });
                }
            }

            if (request.userData.requestType === "getForumData") {
                let fullForumRequest = request.url.replace(
                    "track_visit=false",
                    ""
                );

                let rawJSON;

                try {
                    rawJSON = JSON.parse(
                        await page.$eval(`body`, el => el.innerText)
                    );

                    // fullPostIDs.forEach(

                    //     posts.json?post_ids[]=5944106
                    //     el => (fullForumRequest + `&post_ids%5B%5D=${el}`)
                    // );
                } catch (e) {
                    console.log(`error in getting forum json ${e}`);
                }

                let fullPostIDs = rawJSON.post_stream.stream;
                let topic_ID = rawJSON.post_stream.posts[0].topic_id;
                let fullForumDiscussion = [];

                for (i = 0; i < fullPostIDs.length; i++) {
                    try {
                        let individualPostURL = `https://us.forums.blizzard.com/en/wow/t/${topic_ID}/posts.json?post_ids%5B%5D=${fullPostIDs[i]}`;
                        request;
                        let rawResponse = await requestPromise({
                            url: individualPostURL,
                            method: "GET"
                        });
                        console.log(rawResponse);
                    } catch (e) {
                        console.log(
                            `error in fetching forum post ${individualPostURL} : ${e}`
                        );
                    }
                }

                // let scrapedForumPost = {
                //     id: null,
                //     poster: {
                //         user_name: null,
                //         user_info: null
                //     },
                //     post: {
                //         post_id: null,
                //         post_content: null,
                //         original_post: null, //type: boolean
                //         post_rating: null, //type: number

                //         post_by_blizzard: null
                //     },
                //     replies: {
                //         post_replies: null, //type: number
                //         post_blue_reply: null,
                //         post_children: []
                //     },
                //     updated_at: moment().format("YYYY-MM-DDTHH:mm:ss")
                // };

                // try {
                //     if (
                //         scrapedForumPost.id //&& Other qualifiers for forum data
                //     ) {
                //         await this.collection.updateOne(
                //             { id: scrapedForumPost.id },
                //             { $set: scrapedForumPost },
                //             { upsert: true }
                //         );
                //     }
                // } catch (e) {
                //     console.log(`error loading to mongo: ${e}`);
                // }
            }
        },
        handleFailedRequestFunction: async ({ request }) => {
            // This function is called when the crawling of a request failed too many times
            await Apify.pushData({
                url: request.url,
                succeeded: false,
                errors: request.errorMessages
            });
        }
    });

    await crawler.run();

    console.log("Crawler finished.");

    mongoConnection.close();
});
