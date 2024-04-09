"use client";

import { replyToPost, updatePost } from "@/app/actions";
import { useFormState } from "react-dom";

const initialState = {
  message: "",
};

const USPostsEditable = ({ posts, user }) => {
  console.log("posts", posts);
  function convertTo12Hour(time) {
    const [hour, minute] = time.split(":");
    return new Date(1970, 0, 1, hour, minute).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  const [state, formAction] = useFormState(updatePost, initialState);

  return (
    <div>
      <h1 className="font-bold text-2xl">Posts</h1>
      <ul>
        {posts?.map((post) => {
          const [year, month, day] = post.date.split("-");
          const date = new Date(year, month - 1, day);
          const formattedDate = `${date.toLocaleString("en-US", {
            month: "long",
          })} ${date.getDate()}, ${date.getFullYear()}`;

          return (
            <form action={formAction} key={post._id}>
              <div className="bg-blue-100 p-4 rounded-md mt-4">
                <li id={post._id}>
                  <h3>Posted by: {post.postedBy}</h3>
                  <input type="hidden" name="postId" value={post._id} />
                  <label>
                    <span>Title:</span>
                    <input
                      type="text"
                      defaultValue={post.title}
                      className="form-input mt-1 block w-full"
                      name="title"
                    />
                  </label>

                  <label>
                    <span>Message:</span>
                    <textarea
                      defaultValue={post.message}
                      className="min-h-[200px] w-full"
                      name="message"
                    />
                  </label>

                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-2 w-full">
                    <label className="w-full md:w-1/3">
                      <span>When:</span>
                      <input
                        type="date"
                        defaultValue={post.date}
                        className="form-input mt-1 block w-full"
                        name="date"
                      />
                    </label>
                    <label className="w-full md:w-1/3">
                      <span>Start time:</span>
                      <input
                        type="time"
                        defaultValue={post.startTime}
                        className="form-input mt-1 block w-full"
                        name="startTime"
                      />
                    </label>
                    <label className="w-full md:w-1/3">
                      <span>End time:</span>
                      <input
                        type="time"
                        defaultValue={post.endTime}
                        className="form-input mt-1 block w-full"
                        name="endTime"
                      />
                    </label>
                  </div>

                  <div className="mt-4 mb-4">
                    <label>
                      <span>Court numbers:</span>
                      <input
                        type="text"
                        defaultValue={post.courts || "TBD"}
                        className="form-input mt-1 block w-full"
                        name="courts"
                      />
                    </label>
                  </div>
                  <div className="mt-4 mb-4">
                    <h1>Who's going:</h1>
                    <p>Number of replies: {post.replies.length}</p>
                    {post.replies.map((reply) => (
                      <p key={reply._id}>{reply?.name}</p>
                    ))}
                  </div>
                  <div className="bg-blue-300 rounded-lg p-4 mt-4">
                    <div>
                      <input
                        type="checkbox"
                        name="beginnerClinicOffered"
                        defaultChecked={
                          post?.beginnerClinic?.beginnerClinicOffered
                        }
                      />
                      <label className="ml-2">Beginner Clinic Offered</label>
                    </div>
                    <div className="min-h-[200px] w-full">
                      <label>Beginner Clinic Message</label>
                      <textarea
                        name="beginnerClinicMessage"
                        className="w-full"
                        defaultValue={
                          post?.beginnerClinic?.beginnerClinicMessage
                        }
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-2 w-full">
                      <div className="sm:w-1/2">
                        <label>Beginner Clinic Start Time</label>
                        <input
                          type="time"
                          name="beginnerClinicStartTime"
                          className="w-full"
                          defaultValue={
                            post?.beginnerClinic?.beginnerClinicStartTime
                          }
                        />
                      </div>
                      <div className="sm:w-1/2">
                        <label>Beginner Clinic End Time</label>
                        <input
                          type="time"
                          name="beginnerClinicEndTime"
                          className="w-full"
                          defaultValue={
                            post?.beginnerClinic?.beginnerClinicEndTime
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-4 mb-4">
                      <label>Court number:</label>
                      <input
                        type="text"
                        name="beginnerClinicCourts"
                        defaultValue={
                          post?.beginnerClinic?.beginnerClinicCourts || "TBD"
                        }
                      />
                    </div>
                    <div className="mt-4 mb-4">
                      <h1>Who's going:</h1>
                      <p>
                        Number of replies:{" "}
                        {post?.beginnerClinic?.beginnerClinicReplies?.length}
                      </p>
                      {post?.beginnerClinic?.beginnerClinicReplies?.map(
                        (reply) => (
                          <p key={reply._id}>{reply?.name}</p>
                        )
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn mt-4">
                    Update post
                  </button>
                </li>
                <h1>{state?.message}</h1>
              </div>
            </form>
          );
        })}
      </ul>
    </div>
  );
};

export default USPostsEditable;
