import React from "react";
import { MjmlColumn, MjmlSection, MjmlWrapper } from "mjml-react";
import BaseLayout from "./components/BaseLayout";
import Footer from "./components/Footer";
import Heading from "./components/Heading";
import Header from "./components/Header";
import Text from "./components/Text";
import Link from "./components/Link";
import { fontSize, colors, spacing, fontFamily, screens } from "./theme";

const welcomeStyle = `
  .h1 > * {
    font-size: 56px !important;
  }
  .h2 > * {
    font-size: ${fontSize.lg}px !important;
  }
  .p > * {
    font-size: ${fontSize.base}px !important;
  }

  @media (min-width:${screens.xs}) {
    .h1 > * {
      font-size: 84px !important;
    }
    .h2 > * {
      font-size: ${fontSize.xxl}px !important;
    }
    .p > * {
      font-size: ${fontSize.lg}px !important;
    }
  }
`;

type CreateProps = {
  otp: string;
};

const CreatingAccount = ({ otp }: CreateProps) => {
  return (
    <BaseLayout width={600} style={welcomeStyle}>
      <Header />
      <MjmlWrapper backgroundColor={colors.black}>
        <MjmlSection paddingBottom={spacing.s11} cssClass="gutter">
          <MjmlColumn>
            <Heading maxWidth={420} cssClass="h1" fontFamily={fontFamily.serif}>
              Thank you <br />
              for creating an account
            </Heading>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection cssClass="gutter">
          <MjmlColumn>
            <Text
              cssClass="p"
              fontSize={fontSize.lg}
              paddingBottom={spacing.s8}
            >
              Thank you for creating an account with Holocron, the secure and
              user-friendly OAuth system. We're excited to have you onboard! To
              activate your account and start using the system, please enter the
              below One-Time Password to complete the verification process:
            </Text>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection cssClass="gutter" paddingBottom={36}>
          <MjmlColumn
            padding={32}
            border={`1px solid ${colors.holocron300}`}
            borderRadius={0}
          >
            <Heading
              fontSize={fontSize.xxxl}
              align="center"
              cssClass="sm-hidden"
            >
              {otp}
            </Heading>
            <Heading
              fontSize={fontSize.xxxxl}
              align="center"
              cssClass="lg-hidden"
            >
              {otp}
            </Heading>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingBottom={spacing.s11} cssClass="gutter">
          <MjmlColumn>
            <Text cssClass="p" paddingBottom={spacing.s7}>
              The OTP is valid for 2 minutes. If you did not request an OTP,
              please ignore this email.
            </Text>
            <Text cssClass="p" paddingBottom={spacing.s7}>
              Once you have verified your email address and mobile number, you
              will be able to use the Holocron platform to log into other apps
              registered with the system. This eliminates the need for you to
              remember multiple usernames and passwords for each app you use.
              Additionally, the platform will give you complete transparency and
              control over the apps linked to your account securely and
              conveniently. You can view a list of the apps related to your
              account and choose to opt-out or unlink from any app at any time.
            </Text>
            <Text cssClass="p" paddingBottom={spacing.s7}>
              If you did not create an account with Holocron, please ignore this
              email. If you have any questions or concerns, please contact us at{" "}
              <Link
                color={colors.holocron300}
                textDecoration="underline"
                href="mailto:support@holocron.gjd.one"
              >
                support@holocron.gjd.one
              </Link>
              .
            </Text>
            <Text cssClass="p" paddingBottom={spacing.s7}>
              Thank you for using Holocron!
            </Text>
          </MjmlColumn>
        </MjmlSection>
      </MjmlWrapper>
      <Footer includeUnsubscribe={false} />
    </BaseLayout>
  );
};
CreatingAccount.subject = "Activate your Holocron Account";
export default CreatingAccount;
