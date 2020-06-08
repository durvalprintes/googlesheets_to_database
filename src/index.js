const { GoogleSpreadsheet } = require("google-spreadsheet");
const { Client } = require("pg");
const format = require("pg-format");
const date = require("moment");

const insertData = async (values) => {
  const connectionString =
    "postgresql://postgres:postgres@192.168.99.100:5432/rbe";

  const query =
    "INSERT INTO cov.diario_atendimento2(dt_atendimento, qt_leitosclinicos, qt_leitosclinicosocupados," +
    " qt_leitosur, qt_leitosuti, qt_leitosurocupados, qt_leitosutiocupados, qt_geralleitosinternacoes," +
    " qt_atendimentos_geral, qt_atendimentos_covidleve, qt_atendiementos_covidmoderada, qt_atendimentos_covidgrave," +
    " qt_obitossuspeitos, qt_obitosconfirmados, co_cnes) VALUES %L RETURNING id_registro";
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
  const sheets = [
    // { id: "1Y2D-MZYCZsjDBozDapkIRV3elho9gkSA53ihQ7azTXA", cnes: "0090301" },
    {
      id: "1TwHyvvZ5vvAhni3frDxvZWipMIDIFU2Ea5RbDWfQ7uQ",
      cnes: "2337339",
      nome: "HPSM14_Mario_Pinotti",
    },
  ];

  const spreadsheet = new GoogleSpreadsheet(sheets[0].id);

  await spreadsheet.useServiceAccountAuth(require("../google-credential.json"));

  await spreadsheet.loadInfo();
  const sheet = spreadsheet.sheetsByIndex[0];

  await sheet.loadHeaderRow();
  const columns = sheet.headerValues;

  const rows = await sheet.getRows();

  const today = date().format("DD/MM/yyyy");

  let register,
    values = [];

  for (let i = 0; i < rows.length && rows[i].DATA <= today; i++) {
    register = [];
    columns.forEach((column) => {
      register.push(
        rows[i][column] === "" || rows[i][column] === undefined
          ? "0"
          : rows[i][column]
      );
    });
    register.push(sheets[0].cnes);
    values.push(register);
  }
  insertData(values);
};

insertDataSheet();
