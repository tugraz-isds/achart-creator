{
  const d3 = require("d3")
  const { JSDOM } = require("jsdom");
  const fs = require('fs');
  const csv = require('csvtojson')

  const dom = new JSDOM(`<!DOCTYPE html>
  <meta charset="utf-8">

  <html><body></body></html>`);

  const doc = dom.window.document;

  const fileName = process.argv[2];
  const csvName = process.argv[3];
  const csvPath = 'source/data/csv/' + csvName;
  

  csv()
  .fromFile(csvPath)
  .then((data) => {
      //----------------------------------------------------- insert d3 code ...

      var svg = d3.select(doc).select("body")
          .append("svg")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");


      //----------------------------------------------------- ... until here

      // PRINT OUT:
      fs.writeFileSync('build/svg/' + fileName + '.svg', d3.select(doc).select("body").html());
  });
}
