const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { executablePath } = require('puppeteer');
const { norisdb } = require('../../db/noris/noris');

puppeteer.use(StealthPlugin());



let allData = [];

const getDataFromLogistPro = async ()=>{
    const browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: executablePath() });

    const page = await browser.newPage()

    await page.setDefaultNavigationTimeout(0); // Disable timeout
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.isNavigationRequest() && request.redirectChain().length === 0 && request.url() !== page.url()) {
            request.continue({ url: request.url() });
        } else {
            request.continue();
        }
    });

    await page.goto('https://logistpro.sctp.com.ua/carrier#!/offers/all/')







    await page.waitForSelector('.demo-dialog__close');
    await page.click('.demo-dialog__close');




    // Wait for the input field to be available in the DOM
    await page.waitForSelector('input[data-v-cf3026aa][type="text"]');

    // Type the login value into the input field
    await page.type('input[data-v-cf3026aa][type="text"]', 'ss@ict.lviv.ua');

    // Wait for the input field to be available in the DOM
    await page.waitForSelector('input[data-v-cf3026aa][type="password"]');

    // Type the login value into the input field
    await page.type('input[data-v-cf3026aa][type="password"]', 'Ss0504309397/');

    //    await page.click('button[data-v-ea9a4688]')
    // Listen for the new tab opening
    const [newPage] = await Promise.all([
        new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
        page.click('button[data-v-ea9a4688]') // Click the button that opens the new tab
    ]);

    // Wait for the new tab to load
    await newPage.waitForSelector('body');
    await newPage.waitForSelector('#offers-table');


    // You can now interact with the new tab
    console.log('New tab opened:', await newPage.title());



    // Function to extract data from the current page
    const extractDataFromPage = async () => {
        return newPage.evaluate(() => {
            const rows = document.querySelectorAll('#offers-table > tbody > tr'); // Adjust selector as needed
            let dataArray = [];

            rows.forEach(row => {
                const number = row.querySelector('td:nth-child(1)')?.innerText.trim().replace('Номер/','');
                const comment = row.querySelector('td.offer-column.comment')?.innerText.trim();
                const loadingDate = row.querySelector('td.loading_date')?.innerText.trim();
                const deliveringDate = row.querySelector('td.delivering_date')?.innerText.trim();
                const route = row.querySelector('td:nth-child(6)')?.innerText.trim();
                const loadingLocation = row.querySelector('td:nth-child(7) p')?.innerText.trim();
                const unloadingLocation = row.querySelector('td:nth-child(9) p')?.innerText.trim();
                const transport = row.querySelector('td:nth-child(10)')?.innerText.trim();
                const cargo = row.querySelector('td:nth-child(11)')?.innerText.trim();
                const price = row.querySelector('td:nth-child(12) h3')?.innerText.trim();
                const timeLeft = row.querySelector('td:nth-child(13) h3 p')?.innerText.trim();
                const client = row.querySelector('td:nth-child(14)')?.innerText.trim();


                dataArray.push({
                    number:number.replace(/Номер\/?\n/, ''),
                    comment:comment.replace(/Коментар\/?\n/,''),
                    loadingDate:loadingDate.replace(/Дата завантаження\/?\n/,''),
                    deliveringDate:deliveringDate.replace(/Дата вивантаження\/?\n/,''),
                    route:route.replace(/Маршрут\/?\n/,'').replace(/\n/g, ' '),
                    loadingLocation,
                    unloadingLocation,
                    transport:transport.replace(/Маршрут\/?\n/,'').replace(/\n/g, ' '),
                    cargo:cargo.replace(/Вантаж\/?\n/,''),
                    price,
                    timeLeft,
                    client:client.replace(/Клієнт\/?\n/,'').replace(/\n/g, ' ')

                });
            });

            return dataArray;
        });
    };

    // Function to get the current page number
    const getCurrentPageNumber = async () => {
        return newPage.evaluate(() => {
            const activePage = document.querySelector('.pagination-container .pagination .footable-page.active a');
            console.log('DSADSASD', activePage);

            return activePage ? parseInt(activePage.innerText.trim()) : 1;
        });
    };


    // Function to get the total number of pages
    const getTotalPages = async () => {
        return newPage.evaluate(() => {
            const pageLinks = document.querySelectorAll('.pagination-container .pagination .footable-page a');
            console.log('Page Links:', pageLinks); // Log pageLinks to see what’s selected

            const pageNumbers = Array.from(pageLinks)
                .map(link => {
                    const text = link.innerText.trim();
                    console.log('Page Number Text:', text); // Log the text to verify it's numeric
                    return parseInt(text);
                })
                .filter(num => !isNaN(num)); // Filter out non-numeric values

            console.log('Page Numbers:', pageNumbers); // Log pageNumbers to see the result

            return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 10; // Return max or 1 if empty
        });
    };
    const clickNextPage = async () => {
        await newPage.evaluate(() => {
            const nextButton = document.querySelector('.pagination-container .pagination .footable-page-arrow:last-child');

            console.log('NEXT BUTTON',nextButton);
            
            if (nextButton) {
                nextButton.click();
            } else {
                console.error('Next button not found');
            }
        });
    };

    let currentPage = 1;
    const currentPageNumber = await getCurrentPageNumber()
    let totalPages = await getTotalPages();

    while (currentPage <= totalPages) {
        // Extract data from the current page


        const pageData = await extractDataFromPage();
  
        
        allData = allData.concat(pageData);
        await multiplyLogistData(allData)

        // Get the total number of pages (in case it changes dynamically)
        totalPages = await getTotalPages();


        if (currentPage < totalPages) {
            // Click the next page button
     // Wait for the page to load by checking for a specific element
     await newPage.waitForSelector('#offers-table'); // Adjust selector as needed

    //  await newPage.click('#wrapper > div > div.wrapper.wrapper-content.animated.fadeInRight > div > div > div > div > div > div > div:nth-child(2) > div.ibox-title > div > ul > li:nth-child(7) > a > i'); // Adjust selector as needed
     await newPage.click('.pagination .footable-page-arrow .fa-angle-right'); // Adjust selector as needed
   
            // Update the current page number
            currentPage = await getCurrentPageNumber();

            await multiplyLogistData(allData)
            console.log(currentPage);
            
        } else {
            break;
        }
    }


    async function multiplyLogistData(dataArray) {
        const client = await norisdb.connect();
        try {
          await client.query('BEGIN'); // Почати транзакцію
      
          for (const data of dataArray) {
            // Спочатку спробуємо оновити існуючий запис
            const updateQuery = `
              UPDATE logist_pro_data
              SET comment = $2,
                  loading_date = $3,
                  delivering_date = $4,
                  route = $5,
                  loading_location = $6,
                  unloading_location = $7,
                  transport = $8,
                  cargo = $9,
                  price = $10,
                  time_left = $11,
                  client = $12
              WHERE code = $1;
            `;
            const updateValues = [
              data.number,
              data.comment,
              data.loadingDate,
              data.deliveringDate,
              data.route,
              data.loadingLocation,
              data.unloadingLocation,
              data.transport,
              data.cargo,
              data.price,
              data.timeLeft,
              data.client,
            ];
      
            const updateResult = await client.query(updateQuery, updateValues);
      
            // Якщо оновлення не знайде жодного рядка, виконуємо вставку
            if (updateResult.rowCount === 0) {
              const insertQuery = `
                INSERT INTO logist_pro_data (code, comment, loading_date, delivering_date, route, loading_location, unloading_location,
                                             transport, cargo, price, time_left, client)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
              `;
              await client.query(insertQuery, updateValues);
            }
          }
      
          await client.query('COMMIT'); // Застосувати транзакцію
          console.log('Insert/Update for multiple records successful');
        } catch (err) {
          await client.query('ROLLBACK'); // Відкотити транзакцію в разі помилки
          console.error('Error during Insert/Update:', err.stack);
        } finally {
          client.release();
        }
      }


    await browser.close();
}


module.exports = {getDataFromLogistPro}


