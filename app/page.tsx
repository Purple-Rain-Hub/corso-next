import Image from "next/image";
import Link from "next/link";
import ButtonComponent from "./components/renderTest/ButtonComponent";
import ButtonTestComponent from "./components/renderTest/ButtonTestComponent";

export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
      <Link href="/usersTest">Users Test</Link>
      <ButtonTestComponent />
    </main>
  );
}
