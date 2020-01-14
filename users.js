function returnPage(rows) {
  if (!rows) return;
  rows = sortRows(rows);
  rows = filterUserInOnline(rows);

  let pageStart = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
  `

  let pageEnd = `
  </body>
  </html>
  `

  for (let i = 0; i < rows.length; i++) {
    let block = `
    <div>
      <div>${rows[i][0]}</div>
      <div>${rows[i][1]}</div>
      <div>${rows[i][2]}</div>
      <div>${rows[i][3]}</div>
    </div>
    <br>
    `;

    pageStart += block;
  }

  pageStart += pageEnd;

  return pageStart;
}

function sortRows(rows) {
  rows.sort((a, b) => {
    if(a[4] < b[4]) return -1;
    if(a[4] > b[4]) return 1;
    return 0;
  });

  return rows;
}

function filterUserInOnline(rows) {
  return rows.filter(val => val[3] === "On");
}

module.exports = returnPage;