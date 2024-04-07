import MembersSection from "@/components/MembersSection";
import { getAllMembers } from "@/app/actions";
import { getSession } from "@/app/lib/auth";

const MembersPage = async () => {
  const members = await getAllMembers();
  const session = await getSession();

  return (
    <div>
      <MembersSection members={members} session={session} />
    </div>
  );
};

export default MembersPage;
