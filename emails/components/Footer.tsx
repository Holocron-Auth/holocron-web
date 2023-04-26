import React from "react";
import {
  MjmlSection,
  MjmlWrapper,
  MjmlColumn,
  MjmlText,
  MjmlImage,
  MjmlGroup,
} from "mjml-react";
import Link from "./Link";
import { colors, fontSize, fontWeight } from "../theme";
import { EMAIL_PREFERENCES_URL } from "mailing-core";

type FooterProps = {
  includeUnsubscribe?: boolean;
};

export default function Footer({ includeUnsubscribe = false }: FooterProps) {
  return (
    <>
      <MjmlWrapper backgroundColor={colors.gray800}>
        <MjmlSection paddingTop={32} paddingBottom={24} cssClass="gutter">
          <MjmlColumn>
            <MjmlText
              align="center"
              fontSize={fontSize.xs}
              color={colors.slate400}
              fontWeight={fontWeight.bold}
              textTransform="uppercase"
            >
              Holocron Auth {new Date().getFullYear()}
            </MjmlText>

            <MjmlText
              align="center"
              fontSize={fontSize.xs}
              color={colors.slate400}
              paddingTop={12}
            >
              You received this email to let you know about important changes to
              your Holocron Account and services. © {new Date().getFullYear()}{" "}
              Holocron Auth, IIIT Delhi, New Delhi, India.{` `}
              {includeUnsubscribe && (
                <Link
                  color={colors.slate400}
                  textDecoration="underline"
                  href={EMAIL_PREFERENCES_URL}
                >
                  unsubscribe.
                </Link>
              )}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlWrapper>
    </>
  );
}
