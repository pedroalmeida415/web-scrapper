const cheerio = require("cheerio");
const fs = require("fs");

const iconsFolder = "./Rivella/";

const removeBg = (iconFileName) => {
    const response = fs.readFileSync(`${iconsFolder}${iconFileName}`, { encoding: "utf-8" });
    // console.log(response);
    const $ = cheerio.load(response, {
        normalizeWhitespace: true,
        xmlMode: true,
    });

    // $("path")[0].tagName = "circle";

    console.log("Removing bg of icon " + iconFileName);
    $("g[style='mix-blend-mode:multiply']").remove();

    if ($("circle").length === 0) {
        console.log("Replacing path with circle... ");

        $("path[fill='#EFC0BD']").replaceWith(
            `<circle cx=${parseInt($("svg").attr("width")) / 2} cy=${
                parseInt($("svg").attr("height")) / 2
            } r="14" fill="#EFC0BD"/>`
        );
    }

    fs.writeFileSync(`${iconsFolder}${iconFileName}`, $.xml(), { encoding: "utf-8" });
};

(() => {
    fs.readdirSync(iconsFolder).forEach((fileName) => {
        removeBg(fileName);
    });
})();
