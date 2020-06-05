const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Client } = require("pg");
const format = require("pg-format");

const insertData = async (values) => {
  const connectionString =
    "postgresql://postgres:postgres@192.168.99.100:5432/rbe";

  const query =
    "INSERT INTO cov.diario_atendimento(dt_atendimento, qt_leitosclinicos, qt_leitosclinicosocupados, qt_leitosuti, qt_leitosutiocupados, qt_geralleitosinternacoes, co_cnes) VALUES %L RETURNING id_registro";
  const insert = format(query, values);

  let db;
  try {
    db = new Client({ connectionString });
    await db.connect();
    await db.query("BEGIN");
    const { rows } = await db.query(insert);
    console.log(rows);
    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK");
    console.log(e.stack);
  } finally {
    db.end();
  }
};

const insertDataSheet = async () => {
  const sheets_id = [
    "1Y2D-MZYCZsjDBozDapkIRV3elho9gkSA53ihQ7azTXA",
    "1SHlnlIEoxqQR9Wak_N6e7DHE00aVQUa9MNRywooFOPs",
  ];

  const spreadsheet = new GoogleSpreadsheet(sheets_id[0]);

  await spreadsheet.useServiceAccountAuth(require("../google-credential.json"));

  await spreadsheet.loadInfo();
  console.log(spreadsheet.title);

  const sheet = spreadsheet.sheetsByIndex[0];
  console.log(sheet.title);

  const rows = await sheet.getRows();
  console.log(rows.length);

  let values = [];
  rows.forEach((row) => {
    values.push(row._rawData);
  });

  insertData(values);
};

insertDataSheet();
