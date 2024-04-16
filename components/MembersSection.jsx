import Image from "next/image";
import Link from "next/link";

const MembersSection = ({ members, session }) => {
  if (session.resultObj.memberType === "member") {
    return (
      <div className="mx-auto text-center">
        <h1>Members</h1>
        <ul className="flex flex-wrap space-x-4 space-y-4 flex-col sm:flex-row justify-center">
          {members
            .filter(
              (member) =>
                member.memberType === "member" ||
                member.memberType === "supershark" ||
                member.memberType === "ultrashark"
            )
            .map((member) => (
              <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <a href="#">
                  <Image
                    class="rounded-t-lg"
                    src="/images/zac.webp"
                    alt="profile photo"
                    width={100}
                    height={100}
                  />
                </a>
                <div class="p-5">
                  <a href="#">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {member?.preferredName || member?.firstName}
                    </h5>
                  </a>
                  <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {member?.pronouns}
                  </p>
                  <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {member?.about}
                  </p>
                </div>
              </div>

              // <li key={member.id} className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 mb-10 sm:mb-0 sm:mr-5">
              //     <div className="relative w-full h-48 md:h-64 md:w-48 md:rounded-none md:rounded-l-lg">
              //         <Image
              //             src={member?.profilePic ? member.profilePic : "/images/zac.webp"}
              //             alt={member?.preferredName || member?.firstName}
              //             objectFit="cover"
              //             width={500}
              //             height={500}
              //             layout="responsive"
              //         />
              //     </div>
              //     <div className="flex flex-col justify-between p-4 leading-normal">
              //         <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{member?.preferredName || member?.firstName}</h1>
              //         <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{member?.pronouns}</p>
              //         {member?.about && <p className="font-normal text-gray-700 dark:text-gray-400">{member?.about}</p>}
              //     </div>
              // </li>
            ))}
        </ul>
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
        <div className="mt-4">
          <Link href="/dashboard/member">
            <button className="btn">Return to dashboard</button>
          </Link>
        </div>
      </div>
    );
  }
};

export default MembersSection;
