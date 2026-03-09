import Head from "next/head";
import App from "../components/App";

export default function Home() {
  return (
    <>
      <Head>
        <title>NeyCo — Analisis Keuangan Bisnis</title>
        <meta name="description" content="Platform analisis keuangan AI untuk pebisnis Indonesia" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <App />
    </>
  );
}
