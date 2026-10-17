import { APP_NAME } from "@easycert/types";

export default function HomePage() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>{APP_NAME}</h1>
      <p>Plataforma de gestão de horas complementares.</p>
      <p>API: <code>http://localhost:3333</code></p>
    </main>
  );
}
