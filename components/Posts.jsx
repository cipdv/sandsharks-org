'use server'

import { replyToPost } from "@/app/actions"
import { revalidatePath } from "next/cache";

const Posts = async ({posts, user}) => {

    const formattedPosts = posts?.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        message: post.message,
        date: post.date,
        startTime: post.startTime,
        endTime: post.endTime,
        replies: post.replies.map(reply => ({
            _id: reply._id.toString(),
            name: reply.name,
            email: reply.email
        }))
    }));

    function convertTo12Hour(time) {
        const [hour, minute] = time.split(':');
        return new Date(1970, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      }

    return (
      <div>
          <ul>
              {formattedPosts?.map(post => (
                    <div className="bg-blue-100 p-4 rounded-md mt-4" key={post._id}>
                        <li>
                            <h1 className="font-bold text-2xl mb-2">{post.title}</h1>
                            <h3>Posted by: Cip</h3>
                            <p>{post.message}</p>
                            {post.startTime && (
                            <div>
                                <div className="mt-4">
                                    <h1>When:</h1>
                                    <p>{new Date(new Date(post.date).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>                                
                                    <p>Start time: {convertTo12Hour(post.startTime)}</p>
                                    <p>End time: {convertTo12Hour(post.endTime)}</p>
                                </div>
                                <div className="mt-4 mb-4">
                                    <h1>Court numbers:</h1>
                                    <p>{post.courts || 'TBD'}</p>
                                </div>
                                <div className="mt-4 mb-4">
                                    <h1>Who's going:</h1>
                                {post.replies.map(reply => (
                                    <p key={reply._id}>{reply?.name}</p>
                                ))}
                                </div>
                            </div>)}
                        </li>
                        {new Date(post.date) > new Date() && (
                            <form
                                action={async () => {
                                    'use server'
                                    await replyToPost(post._id)
                                }}
                            >
                                <button type="submit" className='btn'>
                                    {post.replies.some(reply => reply.email === user.email) ? "I can no longer go :(" : "I'll be there :D"}
                                </button>
                            </form>
                        )}         
                    </div>
              ))}
          </ul>
      </div>
    )
  }
  
  export default Posts