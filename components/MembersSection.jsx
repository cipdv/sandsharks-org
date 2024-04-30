import Image from "next/image";
import Link from "next/link";

const MembersSection = ({ members, session }) => {
  if (session.resultObj.memberType === "member") {
    const sortedMembers = [...members]
      .filter(
        (member) =>
          member.memberType === "member" ||
          member.memberType === "supershark" ||
          member.memberType === "ultrashark"
      )
      .sort((a, b) => a.firstName.localeCompare(b.firstName));

    return (
      <div className="mx-auto text-center px-4">
        <div className="flex flex-wrap justify-center gap-4">
          {sortedMembers.map((member, index) => (
            <div className="w-64 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 overflow-auto">
              <div className="w-full h-48 relative rounded-t-lg overflow-hidden">
                <Image
                  className="object-cover absolute inset-0"
                  src={
                    member.profilePic?.status === "approved" &&
                    member.profilePic?.url
                      ? member.profilePic.url
                      : "/images/sandsharks-icon2.svg"
                  }
                  alt="profile photo"
                  layout="fill"
                />
              </div>
              <div class="p-5 break-words text-sm">
                <h5 class="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {member?.firstName}
                </h5>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                  {member?.pronouns}
                </p>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                  {member?.about}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl text-red-500">
          Your current status is pending; you must be an approved member to view
          this section.
        </h1>
        <h1 className="text-2xl text-red-500">Check back later :)</h1>
      </div>
    );
  }
};

export default MembersSection;
