import "../styles/globals.css";
import Link from "next/link";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  getCookie as nextGetCookie,
  setCookie as nextSetCookie,
} from "cookies-next";

const COOKIE_NAME = "ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "REFRESH_TOKEN";

const Header = () => (
  <div
    style={{
      padding: "15px 15px",
      borderBottom: "1px solid white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <h2
      style={{
        margin: 0,
        padding: 0,
        fontWeight: "normal",
      }}
    >
      Cognito App
    </h2>
    <ul style={{ margin: 0, padding: 0, display: "flex" }}>
      <li style={{ display: "block", marginRight: "15px" }}>
        <Link href="/">Home</Link>
      </li>
      <li style={{ display: "block" }}>
        <Link href="/login">Login</Link>
      </li>
    </ul>
  </div>
);

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

MyApp.getInitialProps = async ({ ctx, router }) => {
  if (router.pathname === "/login") return {};

  if (!(await isAuthorised(ctx))) {
    redirect(ctx.req, ctx.res, "/login");
    return {};
  }

  return {};
};

const isAuthorised = async ({ req, res }) => {
  const token = nextGetCookie(COOKIE_NAME, { req, res });
  const refreshToken = nextGetCookie(REFRESH_COOKIE_NAME, { req, res });

  if (!token) {
    return null;
  }

  const verifier = createVerifier();
  const payload = await tryParseToken(token, verifier);

  if (payload !== null) return payload;

  if (refreshToken === null) return null;

  const newTokens = await tryRefreshTokens(refreshToken);

  if (newTokens !== null) {
    console.log("Access token refreshed");

    nextSetCookie(COOKIE_NAME, newTokens.access_token, {
      req,
      res,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    const payload = await tryParseToken(newTokens.access_token, verifier);

    return payload;
  }

  return payload;
};

const tryParseToken = async (token, verifier) => {
  try {
    const payload = await verifier.verify(token);

    return payload;
  } catch {
    return null;
  }
};

const createVerifier = () => {
  return CognitoJwtVerifier.create({
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  });
};

const redirect = (req, res, path) => {
  if (!req) return;

  res.writeHead(302, {
    Location: path,
  });
  res.end();
};

const tryRefreshTokens = async (refresh_token) => {
  const refreshUrl = `${process.env.NEXT_PUBLIC_COGNITO_URI}/oauth2/token`;
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_DOMAIN;
  const secret = process.env.CLIENT_SECRET;

  return new Promise(async (resolve) => {
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/x-www-form-urlencoded",
      }),
      body: Object.entries({
        grant_type: "refresh_token",
        client_id: clientId,
        redirect_uri: redirectUri,
        refresh_token: refresh_token,
        client_secret: secret,
      })
        .map(([k, v]) => `${k}=${v}`)
        .join("&"),
    });

    if (!res.ok) {
      resolve(null);
      return;
    }

    const newTokens = await res.json();

    resolve(newTokens);
  });
};

export default MyApp;

