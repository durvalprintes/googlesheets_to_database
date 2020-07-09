import { smtp } from "../properties";
import mailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";

export default async (date) => {
  try {
    const noreplay = mailer.createTransport(smtp);
    noreplay.use(
      "compile",
      hbs({
        viewEngine: {
          extname: ".hbs",
          layoutsDir: "src/email/",
          defaultLayout: "template",
          partialsDir: "src/email/",
        },
        viewPath: "src/email",
        extName: ".hbs",
      })
    );
    await noreplay.sendMail({
      to: "durvalprintes@gmail.com",
      subject: "Planilhas - Atualização Diária",
      template: "template",
      context: {
        date,
      },
    });
    console.log("Email sent.");
  } catch (error) {
    console.log("Send email failed.\n" + error.stack);
  }
};
