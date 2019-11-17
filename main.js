const Apify = require("apify");

//list global variables

Apify.main(async () => {
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
                        url: forumPostURL,
                        userData: { requestType: "getForumData" }
                    });
                    console.log(forumPostURL);
                }
            }

            if (request.userData.requestType === "getForumData") {
                console.log(
                    `You are looking at forum posts, my dude! -- ${request.url}`
                );
            }

            // await Apify.pushData({
            //     title: scrapedJson.topic_list.topics.fancy_title,
            //     url: request.url,
            //     succeeded: true,
            // });
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
});
