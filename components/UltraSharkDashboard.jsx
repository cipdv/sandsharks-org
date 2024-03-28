import Posts from "./Posts"
import PostForm from "./PostForm"

const UltrasharkDashboard = ({user, posts}) => {

    const { email, firstName, lastName, preferredName, memberType, pronouns, waiver } = user

  return (
    <div>
        <h2>{preferredName}'s Dashboard</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
          <div className="sm:w-1/2">
            <Posts posts={posts}/>
          </div>
          <div className="sm:w-1/2">
            <PostForm />
          </div>
        </div>
    </div>
  )
}

export default UltrasharkDashboard