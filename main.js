const Apify = require('apify');

//list global variables

Apify.main(async () => {
    // Apify.openRequestQueue() is a factory to get a preconfigured RequestQueue instance.
    // We add our first request to it - the initial page the crawler will visit.
    const requestQueue = await Apify.openRequestQueue();
    for (i=0; i<7; i++) {
        await requestQueue.addRequest({ url: `https://us.forums.blizzard.com/en/wow/c/wow-classic/l/latest.json?page=${i}` });


    }

    // Create an instance of the PuppeteerCrawler class - a crawler
    // that automatically loads the URLs in headless Chrome / Puppeteer.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction: async ({ page, request }) => {
            // This function is called to extract data from a single web page
            // 'page' is an instance of Puppeteer.Page with page.goto(request.url) already called
            // 'request' is an instance of Request class with information about the page to load

            let scrapedJson;
            

            try {scrapedJson = JSON.parse(await page.$eval(`body`, el => el.innerText));
            console.log(scrapedJson);
        } catch (e) {
            console.log(`JSON Failure: ${e}`)
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
                errors: request.errorMessages,
            });
        },
    });
    
    await crawler.run();

    // Run the crawler and wait for it to finish.
    await crawler.run();

    console.log('Crawler finished.');
});