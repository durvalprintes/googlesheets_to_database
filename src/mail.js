import { smtp } from "../properties";
import mailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";

export default async (date, error, warn) => {
  try {
    const noreplay = mailer.createTransport(smtp);
    noreplay.use(
      "compile",
      hbs({
        viewEngine: {
          extname: ".hbs",
          layoutsDir: "src/email/",
          defaultLayout: "",
          partialsDir: "src/email/partials",
        },
        viewPath: "src/email",
        extName: ".hbs",
      })
    );

    const email = {
      to: "durvalprintes@gmail.com",
      subject: "Planilhas - Atualização Diária",
      template: error ? "error" : "default",
      context: {
        date,
        warn: warn
          ? ", but some fields was replaced by 0. Check attachment for more details"
          : "",
      },
      attachments: [
        error
          ? {
              filename: "log.txt",
              path: "log.txt",
            }
          : warn
          ? {
              filename: "log-data.txt",
              path: "log-data.txt",
            }
          : { filename: "", path: "" },
      ],
    };
    if (email.attachments[0].filename === "") delete email.attachments;
    await noreplay.sendMail(email);
    console.log("Email sent.");
  } catch (error) {
    console.log("Send email failed.\n" + error.stack);
  }
};
