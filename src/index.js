import { sheets } from "../properties";
import getData from "./api";
import insertData from "./database";
import sendMail from "./mail";
import writeLog from "./log";

import date from "moment";
const yesterday = date().subtract(1, "days").format("DD/MM/yyyy");

const insertDataSheet = async () => {
  let values = [],
    log = false,
    log_data;
  try {
    for (const sheet of sheets) {
      const { registers, replacedByZero } = await getData(sheet, yesterday);
      values = values.concat(registers);
      log_data = replacedByZero;
    }
    values.sort(
      (value_a, value_b) =>
        value_a.dt_atendimento - value_b.dt_atendimento ||
        value_a.co_cnes - value_b.co_cnes
    );
    if (log_data !== "") {
      writeLog(log_data, "log-data.txt");
      console.log(
        "Some fields was replaced by 0. Check data log for more details."
      );
    }
    await insertData(values);
    console.log("Status ok. Check the database.");
  } catch (error) {
    console.log("Status failed. Check log for more details.");
    writeLog(error.stack + "\n", "log.txt");
    log = true;
  } finally {
    sendMail(yesterday, log, log_data !== "");
  }
};

insertDataSheet();
