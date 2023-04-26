import sendMail from "emails";
import CreatingAccount from "emails/CreatingAccount";
import Login from "emails/Login";

export const sendCreatingAccountMail = async (email: string, otp: string) => {
  await sendMail({
    to: email,
    component: <CreatingAccount otp={otp} />,
    subject: "Activate your Holocron Account",
  });
};

export const sendLoginMail = async (email: string, otp: string) => {
  await sendMail({
    to: email,
    component: <Login otp={otp} />,
    subject: "Verify your Holocron Login",
  });
};
