"use client";

import Link from "next/link";
import styles from "@/app/styles/Home.module.css";
import { useSession, signOut } from "@/lib/auth-client";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className={styles.header}>
      <div>Pheno App</div>
      {user ? (
        <>
          Hello {user.email}
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <span>
          <Link href="/sign-in">Sign In</Link> |{" "}
          <Link href="/sign-up">Sign Up</Link>
        </span>
      )}
    </header>
  );
}
