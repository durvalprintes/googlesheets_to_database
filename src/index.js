const config = require("../config");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Client } = require("pg");
const sql = require("sql");
const date = require("moment");
const file = require("fs");
const mailer = require("nodemailer");

sql.setDialect("postgres");
const table = sql.define(config.table);

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

async function executeQuery(db, query) {
  const { rows } = await db.query(query);
  return rows;
}

const insertData = async (values) => {
  let updates = [],
    inserts = [];
  const db = new Client({ connectionString: config.connection });
  let result;
  try {
    await db.connect();
    await db.query("BEGIN");
    for (const value of values) {
      result = await executeQuery(
        db,
        table
          .select(table.id_registro)
          .from(table)
          .where(table.co_cnes.equals(value.co_cnes))
          .and(table.dt_atendimento.equals(value.dt_atendimento))
          .toQuery()
      );
      if (result[0] !== undefined) {
        updates = updates.concat(
          await executeQuery(
            db,
            table
              .update(value)
              .where(table.id_registro.equals(result[0].id_registro))
              .returning(table.id_registro)
              .toQuery()
          )
        );
      } else {
        inserts = inserts.concat(
          await executeQuery(
            db,
            table.insert(value).returning(table.id_registro).toQuery()
          )
        );
      }
    }
    console.log("Updates:", updates);
    console.log("Inserts:", inserts);
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
    fields = [],
    c;

  for (let i = 0; i < rows.length && rows[i].DATA <= today; i++) {
    if (rows[i].DATA > lastWorkday) {
      days.push(rows[i].DATA);
      fields.push([config.table.columns[(c = 1)], doc.cnes]);
      config.columns.forEach((column) => {
        fields.push([
          config.table.columns[++c],
          rows[i][column] === "" || rows[i][column] === undefined
            ? "0"
            : column !== "DATA"
            ? validData(sheet.title, column, rows[i][column])
            : new Date(
                rows[i][column].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3")
              ),
        ]);
      });
      registers.push(Object.fromEntries(fields));
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
    values.sort((value_a, value_b) => value_a.co_cnes - value_b.co_cnes);
    await insertData(values);
    if (replacedByZero != "") {
      Log(replacedByZero, "logData.txt");
      console.log("Some fields was replaced by 0. See data log for details.");
    }
    console.log("Status ok. Check the database.");
  } catch (error) {
    console.log("Status failed. See log for details.");
    Log(error.stack, "log.txt");
  } finally {
    // sendMail();
  }
};

insertDataSheet();
