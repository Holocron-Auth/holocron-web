import React from "react";
import { MjmlColumn, MjmlGroup, MjmlSection, MjmlWrapper } from "mjml-react";
import Text from "./Text";
import Link from "./Link";
import { colors, fontSize, lineHeight, fontWeight } from "../theme";
import { env } from "process";

export default function Header() {
  return (
    <MjmlWrapper padding="40px 0 64px" backgroundColor={colors.black}>
      <MjmlSection cssClass="gutter">
        <MjmlGroup>
          <MjmlColumn width="42%">
            <Text align="left">
              <Link
                color={colors.white}
                fontSize={fontSize.xl}
                fontWeight={fontWeight.bold}
                href="https://holocron-auth.gjd.one"
                textDecoration="none"
              >
                <img
                  height={24}
                  width={112}
                  src={process.env.VERCEL_URL + "/logo-full.png"}
                  alt=""
                  style={{
                    verticalAlign: "text-bottom",
                    paddingRight: 10,
                    paddingBottom: 2,
                  }}
                />
              </Link>
            </Text>
          </MjmlColumn>
          <MjmlColumn width="58%">
            <Text
              align="right"
              fontSize={fontSize.xs}
              lineHeight={lineHeight.tight}
              fontWeight={fontWeight.bold}
            >
              Secure and
              <br />
              User-Friendly
            </Text>
          </MjmlColumn>
        </MjmlGroup>
      </MjmlSection>
    </MjmlWrapper>
  );
}
