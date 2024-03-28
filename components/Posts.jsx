
const Posts = ({posts}) => {

    return (
      <div>
          <h1>Posts</h1>
          <p>Posts will go here</p>
          <ul>
              {posts?.map(post => (
                  <li key={post._id}>
                      <h1>{post.title}</h1>
                      <p>{post.message}</p>
                      <p>{post.date}</p>
                      <p>{post.startTime}</p>
                      <p>{post.endTime}</p>
                  </li>
              ))}
          </ul>
      </div>
    )
  }
  
  export default Posts