import { table, sheetColumns } from "../properties";
import { GoogleSpreadsheet } from "google-spreadsheet";

let replacedByZero = "";

function validData(sheet, date, column, field) {
  if (new RegExp(/[1-9]*[0]*[1-9]+[0-9]{3,}|[0-9]*[^0-9]+[0-9]*/).test(field)) {
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

export default async function (doc, yesterday) {
  const spreadsheet = new GoogleSpreadsheet(doc.id);
  await spreadsheet.useServiceAccountAuth(require("../google-credential.json"));
  await spreadsheet.loadInfo();
  console.log(spreadsheet.title);
  const sheet = spreadsheet.sheetsByIndex[0];
  const rows = await sheet.getRows();
  let registers = [],
    field = [],
    collumn_index;
  for (let row_index = 0; row_index < rows.length; row_index++) {
    if (rows[row_index].DATA === yesterday) {
      field.push([table.columns[(collumn_index = 1)], doc.cnes]);
      sheetColumns.forEach((column) => {
        field.push([
          table.columns[++collumn_index],
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
      break;
    }
  }
  return { registers, replacedByZero };
}
