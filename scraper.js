const cheerio = require("cheerio");
const axios = require("axios").default;

const vgmUrl = "https://www.americanas.com.br/mapa-do-site";

const categories = new Set();

const toSlug = (text) => {
    return text
        .normalize("NFD")
        .toLowerCase()
        .replace(/\s\s+/g, " ")
        .replace(/[^a-zA-Z0-9\s-]+/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-");
};

const fetchData = async () => {
    const response = await axios.get(vgmUrl);
    return cheerio.load(response.data);
};

const getResults = async () => {
    const $ = await fetchData();
    $("#sitemap-pane-categoria .sitemap-block > .sitemap-list > .sitemap-item span").each((i, element) => {
        const categoryName = element.previousSibling.children[0].data;
        let categoryDescription = [];
        $(".sitemap-list .sitemap-item .sitemap-item-link", element.parent.parent).each((index, item) => {
            return categoryDescription.push(item.children[0].data.trim());
        });
        categories.add({
            name: categoryName.trim(),
            slug: toSlug(categoryName),
            description: categoryDescription,
        });
    });

    // let categoriesObject = [];
    // categories.forEach((category) => categoriesObject.push({ name: category }));

    //Convert to an array so that we can sort the results.
    return {
        categories: [...categories].sort((category) => category.name),
    };
};

module.exports = getResults;
