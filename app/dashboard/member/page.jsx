import MemberDashboard from '@/components/MemberDashboard'
import { getSession, logout } from '@/lib'
import { getAllPosts } from '@/app/actions'
import { redirect } from 'next/navigation'
import Waiver from '@/components/Waiver'


const MemberDash = async () => {

    const session = await getSession()
    const user = session?.resultObj
    const posts = await getAllPosts()

  return (
    <>
    {user?.waiver === true ? (
        <MemberDashboard user={user} posts={posts} />

    ) : (
        <Waiver />
    )}
        <form
            action={async () => {
            'use server'
            await logout()
            redirect('/')
            }}
            >
            <button type="submit">Logout</button>
        </form>
    </>
  )
}

export default MemberDash