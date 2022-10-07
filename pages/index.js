export default function Home() {
  const handleLogout = () => {
    const url = `/api/revoke`;

    var requestOptions = {
      method: "GET",
      headers: [],
      redirect: "follow",
    };

    fetch(url, requestOptions)
      .then((response) => response.text())
      .then(() => {
        Router.push("/login");
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <div>
      <h1>Protected Homepage</h1>

      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
