const puppeteer = require("puppeteer");
const fs = require("fs");

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
//     );
//     await page.setViewport({ width: 1280, height: 768 });
//     await page.goto("https://www.americanas.com.br/mapa-do-site", { timeout: 10000, waitUntil: "domcontentloaded" });

//     const result = await page.evaluate(() => {
//         const books = [];
//         document
//             .querySelectorAll("#sitemap-pane-categoria .sitemap-block > .sitemap-list > .sitemap-item .sitemap-list .sitemap-item .sitemap-item-link")
//             .forEach((book) => books.push(book.previousSibling.innerText));
//         return books;
//     });

//     browser.close();
//     return result;
// })();
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 400;
            var timer = setInterval(() => {
                var scrollHeight = 3200;
                window.scrollBy(0, distance);
                totalHeight += distance;

                console.log(`Scrooling page... height: ${totalHeight}`);

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                    console.log(`Scrooling page finished`);
                }
            }, 500);
        });
    });
}

(async () => {
    // Extract partners on the page, recursively check the next page in the URL pattern
    const extractPartners = async (url) => {
        // Scrape the data we want
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
        );
        await page.setViewport({ width: 1280, height: 768 });
        await page.goto(url, { timeout: 40000, waitUntil: "domcontentloaded" });

        await page.waitForSelector("div.product-grid-item .product-card-photo img");

        await autoScroll(page);

        const partnersOnPage = await page.evaluate(() =>
            Array.from(document.querySelectorAll("div.product-grid-item"))
                .slice(0, 24)
                .map((gridCard) => ({
                    name: gridCard.querySelector("h2").innerText.trim(),
                    imageUrl: gridCard.querySelectorAll(".product-card-photo img")[0].getAttribute("src"),
                    category: "celulares-e-smartphones",
                    price: parseFloat(
                        gridCard
                            .querySelector(".dHyYVS.bLZSPZ")
                            .innerText.trim()
                            .split(" ")[1]
                            .replace(".", "")
                            .replace(",", ".")
                    ),
                    details: "",
                }))
        );
        await page.close();

        // Recursively scrape the next page
        if (partnersOnPage.length < 1) {
            // Terminate if no partners exist
            return partnersOnPage;
        } else {
            // Go fetch the next page ?page=X+1
            const nextPageNumber = url.match(/pagina-\d+$/) ? parseInt(url.match(/pagina-(\d+)$/)[1], 10) + 1 : "2";
            console.log(`Fetching page ${nextPageNumber}`);
            const nextUrl = `https://www.americanas.com.br/categoria/celulares-e-smartphones/smartphone/pagina-${nextPageNumber}`;

            if (nextPageNumber == 3) return partnersOnPage;

            return [...new Set(partnersOnPage.concat(await extractPartners(nextUrl)))];
        }
    };

    const browser = await puppeteer.launch();
    const firstUrl = "https://www.americanas.com.br/categoria/celulares-e-smartphones/smartphone";
    const partners = await extractPartners(firstUrl);

    // Todo: Update database with partners
    // console.log(partners);

    await browser.close();

    let jsonString = JSON.stringify(partners);
    fs.writeFileSync("./products.json", jsonString, "utf-8");
})();
