const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { executablePath } = require('puppeteer');
const { norisdb } = require('../../db/noris/noris');

puppeteer.use(StealthPlugin());

const getDataFromLogistPro = async ()=>{
    let allData = [];

    let browser;

    if (process.env.SERVER === 'LOCAL') {
         browser = await puppeteer.launch({ headless: false,args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: executablePath() });
    }else {
        browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: '/usr/bin/google-chrome' });
    }
    const page = await browser.newPage();
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
                const route = row.querySelector('td:nth-child(6)')?.innerText;
                const loadingLocation = row.querySelector('td:nth-child(7) p')?.innerText;
                const unloadingLocation = row.querySelector('td:nth-child(9) p')?.innerText;
                const transport = row.querySelector('td:nth-child(10)')?.innerText.trim();
                const cargo = row.querySelector('td:nth-child(11)')?.innerText.trim();
                const price = row.querySelector('td:nth-child(12) h3')?.innerText.trim();
                const timeLeft = row.querySelector('td:nth-child(13) h3 p')?.innerText.trim();
                const client = row.querySelector('td:nth-child(14)')?.innerText.trim();
                const customsElements = row.querySelectorAll('td:nth-child(8) p');
                const customs = Array.from(customsElements).map(p => p.innerText.trim());
               

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
                    client:client.replace(/Клієнт\/?\n/,'').replace(/\n/g, ' '),
                    customs:customs[0],
                    crossing:customs[1]


                });
            });


            return dataArray;
        });
    };

    // Function to get the current page number
    const getCurrentPageNumber = async () => {
        return newPage.evaluate(() => {
            const activePage = document.querySelector('.pagination-container .pagination .footable-page.active a');
      

            return activePage ? parseInt(activePage.innerText.trim()) : 1;
        });
    };


    // Function to get the total number of pages
    const getTotalPages = async () => {
        return newPage.evaluate(() => {
            const pageLinks = document.querySelectorAll('.pagination-container .pagination .footable-page a');
     

            const pageNumbers = Array.from(pageLinks)
                .map(link => {
                    const text = link.innerText.trim();
        
                    return parseInt(text);
                })
                .filter(num => !isNaN(num)); // Filter out non-numeric values

         t

            return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 10; // Return max or 1 if empty
        });
    };


    let currentPage = 1;
    const currentPageNumber = await getCurrentPageNumber()
    let totalPages = await getTotalPages();

 

    while (currentPage <= totalPages) {
        // Extract data from the current page
        const pageData = await extractDataFromPage();
        allData = allData.concat(pageData);
    
        // Get the total number of pages (in case it changes dynamically)
        totalPages = await getTotalPages();
    
        if (currentPage < totalPages) {
            // Click the next page button
            await newPage.click('.pagination .footable-page-arrow .fa-angle-right');
    
            // Додайте затримку, щоб дочекатися нових даних
            await new Promise(resolve => setTimeout(resolve, 5000)); // Затримка в 2 секунди, можна змінити за потреби
    
            // Update the current page number
            currentPage = await getCurrentPageNumber();
        } else {
            break;
        }
    }
    await browser.close();
 




    return allData;
}


async function multiplyLogistData(dataArray) {
    const client = await norisdb.connect();
    
    try {
        await client.query('BEGIN'); // Почати транзакцію
        const deleteFromTable = await client.query(`delete  from logist_pro_data`); //Очищаємо таблицю перед записом!
        for (const data of dataArray) {
            // console.log('Processing data:', data);
            
            // Перевіряємо, чи існує запис з таким code
            const checkQuery = `
                SELECT 1 FROM logist_pro_data WHERE code = $1;
            `;
            const checkResult = await client.query(checkQuery, [data.number]);

            // Якщо запису немає, виконуємо вставку
            if (checkResult.rowCount === 0) {
                const insertQuery = `
                    INSERT INTO logist_pro_data (
                        code, comment, loading_date, delivering_date, route, loading_location, 
                        unloading_location, transport, cargo, price, time_left, client, customs, crossing
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
                    );
                `;
                const insertValues = [
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
                    data.customs,
                    data.crossing
                ];

                const result = await client.query(insertQuery, insertValues);
                // console.log('Inserted:', result.rowCount);
            } else {
                console.log('Record with code', data.number, 'already exists, skipping insert.');
            }
        }

        await client.query('COMMIT'); // Застосувати транзакцію
    
    } catch (err) {
        await client.query('ROLLBACK'); // Відкотити транзакцію в разі помилки
        console.error('Error during Insert:', err.stack);
    } finally {
        client.release();
    }
}
  const getAndWriteDataLogistPro = async ()=>{
try {
    const data = await getDataFromLogistPro();

    // console.log(data.length,'DATA LENNGTH');
    
  if (data) {
    multiplyLogistData(data)
  }else {
    console.log('ERROR DURING WRITE DATA LOGIST PRO');
    
  }
    
} catch (error) {
    console.log(error);
    
}
  }

module.exports = {getDataFromLogistPro,multiplyLogistData,getAndWriteDataLogistPro}


