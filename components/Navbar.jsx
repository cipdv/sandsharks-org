import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center'>
        <Link href="/">
            <h1>Toronto Sandsharks Beach Volleyball Club</h1>
        </Link>
        <Link href="/signin">
            <button className="btn mt-4 ">
                Sign In
            </button>
        </Link>
    </div>
  )
}

export default Navbar