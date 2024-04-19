import Image from "next/image";
import { deactivateMemberProfile, deleteMemberProfile } from "@/app/_actions";

const USMembersManagement = ({ members }) => {
  return (
    <div className="mt-5">
      <h1 className="font-bold text-2xl">Members</h1>
      <div className="bg-blue-100 p-4 rounded-md mt-4 overflow-x-auto">
        {members
          .filter((member) => member.memberType === "member")
          .map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-md mt-4 flex justify-between items-center"
            >
              <div className="flex items-center">
                <Image
                  src={
                    member?.profilePic?.url
                      ? member.profilePic?.url
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
                    await deactivateMemberProfile(member._id);
                  }}
                  className="mb-2"
                >
                  <button className="btn mr-2" type="submit">
                    Deactive
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
          ))}
      </div>
    </div>
  );
};

export default USMembersManagement;
