import Posts from "./Posts"
import SideNav from "./SideNav"

const MemberDashboard = ({user, posts}) => {

    const { email, firstName, lastName, preferredName, pronouns } = user

    return (
        <div className="w-full sm:w-3/4 lg:w-1/2 mx-auto">
            <h2 className="mb-8 text-3xl font-bold">Hi {preferredName || firstName}!</h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full items-start">
                <div className="w-full">
                    <Posts posts={posts} user={user}/>
                </div>
                <div className="w-full">
                    <SideNav />
                </div>
            </div>
        </div>
    )
}

  
  export default MemberDashboard