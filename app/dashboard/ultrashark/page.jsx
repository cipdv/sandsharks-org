import Posts from "@/components/Posts";
import PostForm from "@/components/PostForm";
import USPostsEditable from "@/components/USPostsEditable";
import { getSession } from "@/app/lib/auth";
import { getAllPosts } from "@/app/actions";

const UltrasharkDashboard = async () => {
  const session = await getSession();
  const userObj = JSON.stringify(session, null, 2);
  const user = session?.resultObj;
  const posts = await getAllPosts();

  return (
    <div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
        <div className="sm:w-1/2">
          <PostForm />
        </div>
        <div className="sm:w-1/2">
          <USPostsEditable posts={posts} user={user} />
        </div>
      </div>
    </div>
  );
};

export default UltrasharkDashboard;
