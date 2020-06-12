const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Client } = require("pg");
const format = require("pg-format");
const date = require("moment");
const config = require("../config");
const file = require("fs");
var error = "",
  days = [];

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
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.end();
  }
};

function validData(sheet, column, field) {
  if (new RegExp(config.rules).test(field)) {
    error +=
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
  if (msg != "") {
    const log = file.createWriteStream(filename, { flags: "a" });
    log.write(
      "\n[" + date().format("MMMM Do YYYY, h:mm:ss a") + "]:\n" + msg + "\n"
    );
    log.end();
  }
};

const insertDataSheet = async () => {
  try {
    let values = [];
    for (const sheet of config.sheets) {
      values = values.concat(await getData(sheet));
    }
    values.sort((value_a, value_b) => value_a[0] - value_b[0]);
    Log(error, "logData.txt");
    await insertData(values);
    console.log("Ok.");
  } catch (e) {
    console.log("Consulte o log.");
    Log(e.stack, "log.txt");
  }
};

insertDataSheet();
