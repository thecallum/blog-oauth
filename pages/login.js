export default function Login() {
  const loginUrl = `${process.env.COGNITO_URI}/login?client_id=${process.env.CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${process.env.DOMAIN}/api/auth`;

  return (
    <div>
      <h1>Login Page</h1>

      <p>
        <a href={loginUrl}>Login</a>
      </p>
    </div>
  );
}

