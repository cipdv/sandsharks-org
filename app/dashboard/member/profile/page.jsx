import MemberProfile from "@/components/MemberProfile";
import { getCurrentUser } from "@/app/actions";

const profile = async () => {
  
  const user = await getCurrentUser();

  return (
    <div>
      <MemberProfile user={user} />
    </div>
  );
};

export default profile;
