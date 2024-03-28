
import Link from 'next/link'

export default async function Page() {
  
  return(
    <section>

      <h1>Home and info</h1>
      <h2>
        <Link href="/signin">Sign in</Link>
      </h2>
      <h2>
        <Link href="/signup">Sign up</Link>
      </h2>
    </section>
  )
}