import MembersSection from "@/components/MembersSection";
import { getAllMembers } from "@/app/_actions";
import { getSession } from "@/app/lib/auth";
import Link from "next/link";

const MembersPage = async () => {
  const members = await getAllMembers();
  const session = await getSession();

  return (
    <div>
      <MembersSection members={members} session={session} />
      <div className="mt-8">
        <Link href="/dashboard/member">
          <button className="btn">Return to dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default MembersPage;
