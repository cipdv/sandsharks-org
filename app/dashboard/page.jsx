import { getAllPosts } from "@/app/actions"
import MemberDashboard from "@/components/MemberDashboard"
import UltrasharkDashboard from "@/components/UltraSharkDashboard"
import { getSession, logout } from "@/lib/auth"
import { redirect } from "next/navigation"

const dashboard = async () => {

    const session = await getSession()
    const userObj = JSON.stringify(session, null, 2)
    const user = session?.resultObj
    const posts = await getAllPosts()

    return (
      <>
          {(user?.memberType === 'pending' || user?.memberType === 'member') && <MemberDashboard user={user} posts={posts} />}
          {user?.memberType === 'ultrashark' && <UltrasharkDashboard user={user} posts={posts} />}
      </>
            
    )
}

export default dashboard

