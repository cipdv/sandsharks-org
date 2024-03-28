import { login } from '@/lib'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const signInPage = () => {

  return (
    <div>
        <form
            action={async (formData) => {
            'use server'
            await login(formData)
            redirect('/')
        }}
      >
        <input type="email" placeholder='Email' name="email" required/>
        <input type="password" placeholder='Password' name="password" required />
        {/* <input type="hidden" name="csrfToken" value={csrfToken} /> */}
        <button type="submit">Login</button>
      </form>
      <h2>
        <Link href="/signup">
          Haven't signed up yet? Sign up here.
        </Link>
      </h2>
    </div>
  )
}

export default signInPage