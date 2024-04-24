import Image from "next/image";
import { approveMemberPhoto, disapproveMemberPhoto } from "@/app/_actions";

const USPendingMembers = ({ members }) => {
  return (
    <div>
      <h1 className="font-bold text-2xl mt-4">Pending Photos</h1>
      <div className="bg-blue-100 p-4 rounded-md mt-4 overflow-x-auto">
        {members.filter((member) => member?.profilePic?.status === "pending")
          .length > 0 ? (
          members
            .filter((member) => member?.profilePic?.status === "pending")
            .map((member) => (
              <div
                key={member.id}
                className="bg-white p-4 rounded-md mt-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <Image
                    src={member?.profilePic?.url || "/images/zac.webp"}
                    alt={member?.preferredName || member?.firstName}
                    width={400}
                    height={400}
                    className="rounded"
                  />
                  <div className="ml-4">
                    <h1 className="font-bold text-2xl">
                      {member.preferredName && `${member.preferredName}, `}
                      {member?.firstName} {member?.lastName}
                    </h1>
                    <p>{member?.pronouns}</p>
                    <p>{member?.email}</p>
                  </div>
                </div>
                <div>
                  <form
                    action={async () => {
                      "use server";
                      await approveMemberPhoto(member._id);
                    }}
                    className="mb-2"
                  >
                    <button className="btn" type="submit">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await disapproveMemberPhoto(member._id);
                    }}
                  >
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      type="submit"
                    >
                      Disapprove
                    </button>
                  </form>
                </div>
              </div>
            ))
        ) : (
          <h1>There are no photos pending approval at this time</h1>
        )}
      </div>
    </div>
  );
};

export default USPendingMembers;
