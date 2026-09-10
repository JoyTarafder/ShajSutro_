import nodemailer, { Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const isCustomSmtp = Boolean(process.env.EMAIL_HOST);
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  cachedTransporter = nodemailer.createTransport(
    isCustomSmtp
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 465,
          secure: (process.env.EMAIL_PORT || "465") === "465",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {
          service: "gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        }
  );

  return cachedTransporter;
}

const transporter = {
  sendMail: (options: any) => getTransporter().sendMail(options),
  verify: (callback?: any) => getTransporter().verify(callback),
};

export default transporter;

