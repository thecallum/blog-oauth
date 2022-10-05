import { setCookie as nextSetCookie } from "cookies-next";

const COOKIE_NAME = "ACCESS_TOKEN";
const REDIRECT_URL = process.env.DOMAIN;

export default function handler(req, res) {
  if (req.method !== "GET") return;

  const { code } = req.query;

  return new Promise((resolve) => {
    verifyToken(code)
      .then((body) => {
        const { access_token } = JSON.parse(body);

        nextSetCookie(COOKIE_NAME, access_token, {
          req,
          res,
          path: "/",
          sameSite: "lax",
          httpOnly: true,
        });

        res.writeHead(302, {
          Location: REDIRECT_URL,
        });

        res.end();
        resolve();
      })
      .catch((error) => {
        res.status(500).end();
        resolve();
      });
  });
}

const verifyToken = (code) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const authEndpoint = `${process.env.DOMAIN}/api/auth`;

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "authorization_code");
  urlencoded.append("code", code);
  urlencoded.append("client_id", clientId);
  urlencoded.append("redirect_uri", authEndpoint);
  urlencoded.append("client_secret", clientSecret);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  return new Promise((resolve) => {
    fetch(`${process.env.COGNITO_URI}/token`, requestOptions)
      .then((response) => response.text())
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
