import file from "fs";
import date from "moment";

export default (msg, filename) => {
  const log = file.createWriteStream(filename, { flags: "w" });
  log.write(
    "[" + date().format("MMMM Do YYYY, h:mm:ss a") + "]:\n" + msg + "\n"
  );
  log.end();
};
