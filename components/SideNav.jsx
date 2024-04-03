import Link from "next/link"

const SideNav = () => {
  return (
    <div>
        <div>
            <Link href="/dashboard/member/league-history">
                <h1>Learn more about the history of Sandsharks</h1>
            </Link>
        </div>
        <div>
            <Link href="/dashboard/member/rules">
                <h1>Learn the rules of the game</h1>
            </Link>
        </div>
        <div>
            <Link href="/dashboard/member/members">
                <h1>Get to know our members</h1>
            </Link>
        </div>
        <div>
            <Link href="/dashboard/member/profile">
                <h1>Update your profile - tell us about yourself :)</h1>
            </Link>
        </div>
    </div>
  )
}

export default SideNav