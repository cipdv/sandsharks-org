import { getSession, logout } from '@/lib'
import { getAllPosts, getWaivers } from '@/app/actions'
import { redirect } from 'next/navigation'
//components
import Waiver from '@/components/Waiver'
import MemberDashboard from '@/components/MemberDashboard'


const MemberDash = async () => {
    const session = await getSession()
    const user = session?.resultObj
    const posts = await getAllPosts()
    const waivers = await getWaivers()

    const hasWaiver = waivers.some(waiver => waiver.memberId === user._id)

    return (
        <>
            {hasWaiver ? (
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
                <button type="submit" className='btn mt-4'>Logout</button>
            </form>
        </>
    )
}

export default MemberDash
