import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  getCookie as nextGetCookie,
  setCookie as nextSetCookie,
  deleteCookie as nextDeleteCookie,
} from "cookies-next";

const COOKIE_NAME = "ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "REFRESH_TOKEN";

export default function handler(req, res) {
  if (req.method !== "GET") return;

  return new Promise((resolve, reject) => {
    const refreshToken = nextGetCookie(REFRESH_COOKIE_NAME, { req, res });

    revokeToken(refreshToken)
      .then(() => {
        nextDeleteCookie(COOKIE_NAME, {
          req,
          res,
          path: "/",
          sameSite: "lax",
          httpOnly: true,
        });

        nextDeleteCookie(REFRESH_COOKIE_NAME, {
          req,
          res,
          path: "/",
          sameSite: "lax",
          httpOnly: true,
        });

        res.status(200).send();
        resolve();
      })
      .catch((error) => {
        res.status(500).end();
        resolve();
      });
  });
}

const revokeToken = (refreshToken) => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const credentials = `Basic ${Buffer.from(
    clientId + ":" + clientSecret
  ).toString("base64")}`;

  var myHeaders = new Headers();

  myHeaders.append("Authorization", credentials);
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("client_id", clientId);
  urlencoded.append("token", refreshToken);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  return new Promise((resolve, reject) => {
    fetch(
      `${process.env.NEXT_PUBLIC_COGNITO_URI}/oauth2/revoke`,
      requestOptions
    )
      .then((response) => response.text())
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

