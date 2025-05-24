const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');


let resultadosArray = [];

(async () => {
    try {
        console.log('::: Iniciando proceso :::');

        let url = 'https://quotes.toscrape.com/';
        let BotonNext = true;

        while (BotonNext) {
            let response = await requestPromise(url);
            const $ = cheerio.load(response);

            //Extraemos las citas
        $('div.quote').each((i, elem) => {
        let textoQ = $(elem).find('.text').text().trim();
        console.log("Texto: ", textoQ);

        let autorQ = $(elem).find('.author').text().trim();
        console.log("Autor: ", autorQ);

        let tagsQ = [];
        $(elem).find('.tags .tag').each((j, tagElem) => {
        tagsQ.push($(tagElem).text().trim());
        });
        console.log("Tags: ", tagsQ);

        let objetoData = {
        texto: textoQ,
        autor: autorQ,
        tags: tagsQ
         };

        resultadosArray.push(objetoData);
        });


            // Verificamos si hay botón "Next"
            const siguiente = $('.pager .next a').attr('href');
            if (siguiente) {
                url = 'https://quotes.toscrape.com' + siguiente;
            } else {
                BotonNext = false;
            }
        }


          //Crear un archivo  .JSON
          let data = JSON.stringify(resultadosArray);
          fs.writeFileSync('ResultadosObject.json', data);
          console.log("::::ARCHIVO JSON TERMINADO::::");

          
        // Crear archivo csv
        const fields = ['texto', 'autor', 'tags' ]
        const json2csvParse = new Parser({
          fields: fields,
          defaultValue: 'No info'
      })
        const csv = json2csvParse.parse(resultadosArray);
        fs.writeFileSync("./resultados.csv", csv, "utf-8");
        console.log('Archivo Resultados.CSV creado')

        // Crear archivo de excel
        const worksheet = XLSX.utils.json_to_sheet(resultadosArray)

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          workbook, worksheet, 'Citas'
      );

        XLSX.writeFile(workbook, 'resultados.xlsx');
        console.log('Se creon el archivo resultados.xlsx')



        console.log('::: Proceso finalizado :::');
        console.log(resultadosArray);
    } catch (error) {
        console.error('Se esta presentyando un error durante el scraping', error);
    }
})();
