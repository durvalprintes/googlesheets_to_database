const property = require("../properties");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Client } = require("pg");
const sql = require("sql");
const date = require("moment");
const file = require("fs");
const mailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

sql.setDialect("postgres");
const table = sql.define(property.table),
  today = date().format("DD/MM/yyyy"),
  lastWorkday =
    date().day() === 1
      ? date().subtract(2, "days").format("DD/MM/yyyy")
      : date().subtract(1, "days").format("DD/MM/yyyy");
let replacedByZero = "";

const insertData = async (values) => {
  const db = new Client({ connectionString: property.connection });
  try {
    await db.connect();
    await db.query("BEGIN");
    for (const value of values) {
      const { rows } = await db.query(
        table
          .select(table.id_registro)
          .from(table)
          .where(table.co_cnes.equals(value.co_cnes))
          .and(table.dt_atendimento.equals(value.dt_atendimento))
          .toQuery()
      );
      if (rows[0] !== undefined) {
        await db.query(
          table
            .update(value)
            .where(table.id_registro.equals(rows[0].id_registro))
            .returning(table.id_registro)
            .toQuery()
        );
      } else {
        await db.query(
          table.insert(value).returning(table.id_registro).toQuery()
        );
      }
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.end();
  }
};

function validData(sheet, date, column, field) {
  if (new RegExp(/[1-9]*[0]*[1-9]+[0-9]{3,}|[^0-9]+/).test(field)) {
    replacedByZero +=
      "Data error in " +
      sheet +
      " at date record " +
      date +
      " and collumn " +
      column +
      ", read value is " +
      field +
      ".\n";
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
  let registers = [],
    field = [],
    collumn_index;
  for (
    let row_index = 0;
    row_index < rows.length && rows[row_index].DATA <= today;
    row_index++
  ) {
    if (rows[row_index].DATA > lastWorkday) {
      field.push([property.table.columns[(collumn_index = 1)], doc.cnes]);
      property.sheetColumns.forEach((column) => {
        field.push([
          property.table.columns[++collumn_index],
          rows[row_index][column] === "" ||
          rows[row_index][column] === undefined
            ? "0"
            : column !== "DATA"
            ? validData(
                spreadsheet.title,
                rows[row_index].DATA,
                column,
                rows[row_index][column]
              )
            : new Date(
                rows[row_index][column].replace(
                  /(\d{2})\/(\d{2})\/(\d{4})/,
                  "$2/$1/$3"
                )
              ),
        ]);
      });
      registers.push(Object.fromEntries(field));
    }
  }
  return registers;
}

const writeLog = (msg, filename) => {
  const log = file.createWriteStream(filename, { flags: "a" });
  log.write(
    "[" + date().format("MMMM Do YYYY, h:mm:ss a") + "]:\n" + msg + "\n"
  );
  log.end();
};

const sendMail = async () => {
  try {
    const noreplay = mailer.createTransport(property.email);
    noreplay.use("compile", hbs(property.handlebarsOptions));
    await noreplay.sendMail({
      to: "durvalprintes@gmail.com",
      subject: "Atendimento diário",
      template: "template",
      context: {
        date: today,
      },
    });
    console.log("Email sent.");
  } catch (error) {
    console.log("Send email failed.\n" + error.stack);
  }
};

const insertDataSheet = async () => {
  try {
    let values = [];
    for (const sheet of property.sheets) {
      values = values.concat(await getData(sheet));
    }
    values.sort(
      (value_a, value_b) =>
        value_a.dt_atendimento - value_b.dt_atendimento ||
        value_a.co_cnes - value_b.co_cnes
    );
    await insertData(values);
    if (replacedByZero != "") {
      writeLog(replacedByZero, "logData.txt");
      console.log("Some fields was replaced by 0. See data log for details.");
    }
    console.log("Status ok. Check the database.");
  } catch (error) {
    console.log("Status failed. See log for details.");
    writeLog(error.stack + "\n", "log.txt");
  } finally {
    sendMail();
  }
};

insertDataSheet();
