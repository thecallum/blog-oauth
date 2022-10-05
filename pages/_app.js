import "../styles/globals.css";

import { CognitoJwtVerifier } from "aws-jwt-verify";
import { getCookie as nextGetCookie } from "cookies-next";

const COOKIE_NAME = "ACCESS_TOKEN";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

MyApp.getInitialProps = async ({ ctx, router }) => {
  if (router.pathname === "/login") return {};

  if (!(await isAuthorised(ctx))) {
    redirect(ctx.req, ctx.res, "/login");
    return;
  }

  return {};
};

const isAuthorised = async ({ req, res }) => {
  const token = nextGetCookie(COOKIE_NAME, { req, res });

  if (!token) {
    return null;
  }

  const verifier = createVerifier();
  const payload = await tryParseToken(token, verifier);

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

export default MyApp;

