import { sheets } from "../properties";
import getData from "./api";
import insertData from "./database";
import sendMail from "./mail";
import writeLog from "./log";

import date from "moment";
const yesterday = date().subtract(1, "days").format("DD/MM/yyyy");

const insertDataSheet = async () => {
  try {
    let values = [];
    for (const sheet of sheets) {
      values = values.concat(await getData(sheet, yesterday));
    }
    values.sort(
      (value_a, value_b) =>
        value_a.dt_atendimento - value_b.dt_atendimento ||
        value_a.co_cnes - value_b.co_cnes
    );
    await insertData(values);
    console.log("Status ok. Check the database.");
  } catch (error) {
    console.log("Status failed. See log for details.");
    writeLog(error.stack + "\n", "log.txt");
  } finally {
    sendMail(yesterday);
  }
};

insertDataSheet();
