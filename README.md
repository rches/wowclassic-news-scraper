<h1>WoW Classic News Scraper</h1>

<h3>About</h3>
<p>The WoW Classic News Scraper takes a peek into the realm of Blizzard Official forums to identify hot-topics and key issues on the fly. With new information and view-points coming out every minute, it's easy to get lost in the sea of forum posts. For anyone who loves WoW classic, but doesn't have the time to 'try-hard', then this is for you.</p>
<h3>Why even make this?</h3>
<p>As a father, full time coder and all the while trying to stay busy keeping up with the hottest trends, I don't have the time to spend combing through forum posts and engaging in online keyboard battles. I also find that my usual way of getting up-to-soeed on topics of interests, podcasts, take too long and leave a large gap in time when I need information quickly and cleanly. This is a way to help currate and stay up to date on a game I still love.</p>

<p>I'm still pruning out the scraping logic and identifying resources for this data, but I'm optimistic that being able to evaluate the data will help others quickly find the newest scuttlebutt happening around the World of Warcraft: Classic</p>

<h3>How it works</h3>
<p>Apify helps currate requests to identify which kind of forum page we're looking at.</p>
<p>Puppetteer helps us crawl and parse and get anything we ever needed.</p>

<h3>Next Steps</h3>
<ul>
<li>[ ] Scrape individual forum posts</li>
<li>[ ] Identify real world cues that the data points to (i.e. multiple posts duscuss a certain add on: investigate this add on and why it is controversial)</li>
<li>[ ] Get a DB going</li>
<li>[ ] Establish a clean data structure for parsing</li>
<li>[ ] Take a wholistic look at the app and how best to use the data</li>
</ul>

<p>UPDATE: 11/30 - Configuration needs to be done to retrieve ALL forum posts. Currently, GET request only retrieves up to 20 posts (including topic post) of a topic. Currently, the post IDs are concatonated into one GET request, but that still will only return a maximum of 20 posts. Will update with work around to ensure all posts for a topic post are scraped at once for preservation of data.</p>
