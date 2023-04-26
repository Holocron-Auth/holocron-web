import nodemailer from "nodemailer";
import { buildSendMail } from "mailing-core";
import { env } from "process";

let mailConfig = {
  host: "smtp.mail.me.com",
  port: 587,
  secure: false,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
};

const transport = nodemailer.createTransport(mailConfig);

const sendMail = buildSendMail({
  transport,
  defaultFrom: "Holocron <no-reply@holocron.gjd.one>",
  configPath: "./mailing.config.json",
});

export default sendMail;
