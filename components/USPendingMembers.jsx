import Image from "next/image";
import { approveMemberProfile, deleteMemberProfile } from "@/app/actions";

const USPendingMembers = ({ members }) => {
  return (
    <div>
      <h1 className="font-bold text-2xl">Pending Members</h1>
      <div className="bg-blue-100 p-4 rounded-md mt-4 overflow-x-auto">
        {members.filter((member) => member.memberType === "pending").length >
        0 ? (
          members
            .filter((member) => member.memberType === "pending")
            .map((member) => (
              <div
                key={member.id}
                className="bg-white p-4 rounded-md mt-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <Image
                    src={
                      member?.profilePic
                        ? member.profilePic
                        : "/images/zac.webp"
                    }
                    alt={member?.preferredName || member?.firstName}
                    width={100}
                    height={100}
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
                      await approveMemberProfile(member._id);
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
                      await deleteMemberProfile(member._id);
                    }}
                  >
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
        ) : (
          <h1>There are no pending members at this time</h1>
        )}
      </div>
    </div>
  );
};

export default USPendingMembers;
