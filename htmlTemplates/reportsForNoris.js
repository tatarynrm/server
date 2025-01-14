const generateReportHTML = (trips) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Місячний звіт</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #0056a3;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .body {
            padding: 20px;
          }
          .body h2 {
            color: #0056a3;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          table th {
            background-color: #f4f4f4;
            color: #0056a3;
          }
          .footer {
            text-align: center;
            padding: 10px;
            background-color: #f4f4f4;
            font-size: 12px;
            color: #666666;
          }
          .footer a {
            color: #0056a3;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <h1>Місячний звіт</h1>
            <p>Результати рейсів за обраний період</p>
          </div>
  
          <!-- Body -->
          <div class="body">
            <h2>Шановний перевізнику,</h2>
            <p>
              Нижче наведено детальний звіт за всіма вашими рейсами протягом місяця:
              А саме : ${trips.length} рейсів
            </p>
  
            <table>
              <thead>
                <tr>
                  <th>Номер заявки</th>
                  <th>Порядковий номер</th>
                </tr>
              </thead>
              <tbody>
                ${trips
                  .map(
                    (trip) => `
                  <tr>
                    <td>${trip.model}</td>
                    <td>${trip.inv_number} </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
  
          <!-- Footer -->
          <div class="footer">
            <p>© 2025 Транспортна компанія. Усі права захищені.</p>
            <p>
              <a href="https://ict.lviv.ua">Вебсайт</a> | 
              <a href="mailto:support@example.com">Підтримка</a> | 
              <a href="#">Відписатися</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  };


module.exports = generateReportHTML;