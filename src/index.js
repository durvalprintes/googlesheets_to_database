const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Client } = require("pg");
const format = require("pg-format");
const date = require("moment");
const config = require("../config");
const file = require("fs");
const mailer = require("nodemailer");
var replacedByZero = "",
  days = [];

const sendMail = async () => {
  const noreplay = mailer.createTransport(config.email);
  noreplay.sendMail(config.emailOptions, (err, res) => {
    if (err) {
      throw err;
    } else {
      console.log("Email sent.");
    }
  });
};

const insertData = async (values) => {
  const connectionString = config.connection;
  let db;
  try {
    db = new Client({ connectionString });
    await db.connect();
    await db.query("BEGIN");
    await db.query(format(config.delete, [...new Set(days)]));
    await db.query(format(config.insert, values));
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.end();
  }
};

function validData(sheet, column, field) {
  if (new RegExp(/[[1-9]*[0]*[1-9]+[0-9]{3,}|[^0-9]+/).test(field)) {
    replacedByZero +=
      "Data error in " +
      sheet +
      " at " +
      column +
      " on read value " +
      field +
      ", replaced by 0.\n";
    return "0";
  }
  return field;
}

async function getData(doc) {
  const spreadsheet = new GoogleSpreadsheet(doc.id);
  await spreadsheet.useServiceAccountAuth(require("../google-credential.json"));
  await spreadsheet.loadInfo();
  const sheet = spreadsheet.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const today = date().format("DD/MM/yyyy");
  const lastWorkday =
    date().day() === 1
      ? date().subtract(2, "days").format("DD/MM/yyyy")
      : date().subtract(1, "days").format("DD/MM/yyyy");
  let registers = [],
    fields;

  for (let i = 0; i < rows.length && rows[i].DATA <= today; i++) {
    if (rows[i].DATA > lastWorkday) {
      days.push(rows[i].DATA);
      fields = [doc.cnes];
      config.columns.forEach((column) => {
        fields.push(
          rows[i][column] === "" || rows[i][column] === undefined
            ? "0"
            : column !== "DATA"
            ? validData(sheet.title, column, rows[i][column])
            : rows[i][column]
        );
      });
      registers.push(fields);
    }
  }

  return registers;
}

const Log = (msg, filename) => {
  const log = file.createWriteStream(filename, { flags: "a" });
  log.write(
    "\n[" + date().format("MMMM Do YYYY, h:mm:ss a") + "]:\n" + msg + "\n"
  );
  log.end();
};

const insertDataSheet = async () => {
  try {
    let values = [];
    for (const sheet of config.sheets) {
      values = values.concat(await getData(sheet));
    }
    values.sort((cnes_a, cnes_b) => cnes_a[0] - cnes_b[0]);
    await insertData(values);
    if (replacedByZero != "") {
      Log(replacedByZero, "logData.txt");
      console.log("Some fields was replaced by 0. See Data log for details.");
    }
    console.log("Status ok. Check the database.");
  } catch (error) {
    console.log("Status failed. See error log for details.");
    Log(error.stack, "log.txt");
  } finally {
    sendMail();
  }
};

insertDataSheet();
