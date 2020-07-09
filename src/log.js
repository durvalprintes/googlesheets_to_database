import file from "fs";

export default (msg, filename) => {
  const log = file.createWriteStream(filename, { flags: "a" });
  log.write(
    "[" + date().format("MMMM Do YYYY, h:mm:ss a") + "]:\n" + msg + "\n"
  );
  log.end();
};
