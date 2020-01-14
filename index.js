const fs = require("fs");
const http = require('http');
const pgp = require("pg-promise")();

const returnPage = require("./users");

const user = "postgres";
const password = "qwerty";
const host = "localhost";
const portDB = "5432";
const nameDB = "test";
const port = 3000;

const requiredFields = ["Ник", "Email", "Зарегистрирован", "Статус"];
const rows = [];

const queryCreateTable = `
CREATE TABLE users (
  id SERIAL primary key,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  created BIGINT NOT NULL,
  status varchar(3) NOT NULL 
);`;

const requestHandler = (request, response) => {
  response.end(returnPage(rows));
}
const server = http.createServer(requestHandler);
server.listen(port, (err) => {
  if (err) return console.log('something bad happened', err);
  console.log(`server is listening on ${port}`);
})

init();
function init() {
  const file = fs.readFileSync("./test.csv", "utf8");
  const lines = file.split("\n");
  
  if (filterLines(lines) == false) return;
  recordDB();
}

function filterLines(lines) {
  for (let i = 0; i < lines.length; i++) {
    let fields = lines[i].split(";");
    trimmedFields = fields.map((val) => {
      return val.trim();
    })
    trimmedFields[4] = parseDate(trimmedFields[2]); 

    /* 
      [0] - name, 
      [1] - email, 
      [2] - date-string, 
      [3] - status, 
      [4] - date in milliseconds 
    */

    if (i == 0) {
      if (!checkRequiredFields(trimmedFields)) {
        console.log("Not correct fields");
        return false;
      }
    } else {
      rows.push(trimmedFields);
    }
  }
}

function checkRequiredFields(fields) {
  for (let i = 0; i < fields.length; i++) {
    if (requiredFields[i] !== fields[i] && i < 3) { // if current index > 3, then nonRequired fields no check
      return false;
    }
  }

  return true;
}

async function recordDB() {
  const db = pgp(`postgres://${user}:${password}@${host}:${portDB}/${nameDB}`);

  const res = await db.query(queryCreateTable);
  console.log("Table users created");

  for (let i = 0; i < rows.length; i++) {
    await recordDBRow(db, rows[i]);
  }
}

function parseDate(date) {
  let fullDate = date.split(" ")[0];
  let hours = date.split(" ")[1];

  const splitedFullDate = fullDate.split(".");

  const day = splitedFullDate[0];
  const month = splitedFullDate[1];
  const year = splitedFullDate[2];

  const correctDate = `${month}.${day}.${year} ${hours}`;
  const unixTimeDate = Date.parse(correctDate) / 1000; //milliseconds -> seconds

  return unixTimeDate;
}

async function recordDBRow(db, row) {
  const queryRecordRow = `
    INSERT INTO users 
    (name, email, created, status)
    values ('${row[0]}', '${row[1]}', ${row[4]}, '${row[3]}')
  `;

  const res = await db.query(queryRecordRow);
  row = [row[0], row[1], row[2], row[3]]; // not showing millisecond in log
  console.log("Inserted row: ", row);
}
