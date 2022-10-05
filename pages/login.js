export default function Login() {
  const loginUrl = `${process.env.NEXT_PUBLIC_COGNITO_URI}/login?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${process.env.NEXT_PUBLIC_DOMAIN}/api/auth`;

  return (
    <div>
      <h1>Login Page</h1>

      <p>
        <a href={loginUrl}>Login</a>
      </p>
    </div>
  );
}

