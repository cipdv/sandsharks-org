import Posts from "@/components/Posts"
import PostForm from "@/components/PostForm"
import { getSession, logout } from "@/lib"
import { getAllPosts } from "@/app/actions"
import { redirect } from "next/navigation"

const UltrasharkDashboard = async () => {

    const session = await getSession()
    const userObj = JSON.stringify(session, null, 2)
    const user = session?.resultObj
    const posts = await getAllPosts()

  return (
    <div>
        <h2>{user?.preferredName}'s Dashboard</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
          <div className="sm:w-1/2">
            <Posts posts={posts}/>
          </div>
          <div className="sm:w-1/2">
            <PostForm />
          </div>
        </div>
        <form
            action={async () => {
            'use server'
            await logout()
            redirect('/')
            }}
            >
            <button type="submit">Logout</button>
        </form>
    </div>
  )
}

export default UltrasharkDashboard