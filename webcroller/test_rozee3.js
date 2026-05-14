import fs from "fs"; import * as cheerio from "cheerio"; const html = fs.readFileSync("rozee_test.html", "utf8"); const $ = cheerio.load(html); console.log($(".job").first().html());
