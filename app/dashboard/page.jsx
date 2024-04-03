// import { getAllPosts } from "@/app/actions"
// import MemberDashboard from "@/components/MemberDashboard"
// import UltrasharkDashboard from "@/components/UltraSharkDashboard"
// import { getSession, logout } from "@/lib"
// import { redirect } from "next/navigation"

// const dashboard = async () => {

//     const session = await getSession()
//     const userObj = JSON.stringify(session, null, 2)
//     const user = session?.resultObj
//     const posts = await getAllPosts()

//     return (
//         <div>
//             {user?.waiver === true ? (
//                 <>
//                     {user?.memberType === 'member' && <MemberDashboard user={user} posts={posts} />}
//                     {user?.memberType === 'ultrashark' && <UltrasharkDashboard user={user} posts={posts} />}
//                 </>
//             ) : (
//                 <p>waiver</p>
//             )}
//             <form
//             action={async () => {
//             'use server'
//             await logout()
//             redirect('/')
//             }}
//             >
//             <button type="submit">Logout</button>
//             </form>
//         </div>
//     )
// }

// export default dashboard

const dashboardPage = () => {
  return <div>dashboardPage</div>;
};

export default dashboardPage;
