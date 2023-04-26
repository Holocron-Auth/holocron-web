import React from "react";
import CreatingAccount from "../CreatingAccount";
import Login from "../Login";

export function accountcreated() {
  return <CreatingAccount otp="696969" />;
}

export function login() {
  return <Login otp="696969" />;
}
