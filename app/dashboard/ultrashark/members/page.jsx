import { getAllMembers } from "@/app/actions";
import USMemberManagement from "@/components/USMemberManagement";
import USPendingMembers from "@/components/USPendingMembers";

const USMembersPage = async () => {
  const members = await getAllMembers();

  return (
    <div>
      <div>
        <USPendingMembers members={members} />
      </div>
      <div>
        <USMemberManagement members={members} />
      </div>
    </div>
  );
};

export default USMembersPage;
