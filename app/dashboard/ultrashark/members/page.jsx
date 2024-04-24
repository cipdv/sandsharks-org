import { getAllMembers } from "@/app/_actions";
import USMemberManagement from "@/components/USMemberManagement";
import USPendingMembers from "@/components/USPendingMembers";
import USPendingPhotos from "@/components/USPendingPhotos";

const USMembersPage = async () => {
  const members = await getAllMembers();

  return (
    <div>
      <div>
        <USPendingMembers members={members} />
      </div>
      <div>
        <USPendingPhotos members={members} />
      </div>
      <div>
        <USMemberManagement members={members} />
      </div>
    </div>
  );
};

export default USMembersPage;
