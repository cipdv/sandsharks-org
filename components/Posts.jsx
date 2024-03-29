
const Posts = ({posts}) => {

    return (
      <div >
          <ul>
              {posts?.map(post => (
                  <li className="bg-blue-100 p-4 rounded-md mt-4" key={post._id}>
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