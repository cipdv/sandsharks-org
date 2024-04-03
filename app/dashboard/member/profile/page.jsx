import MemberProfile from "@/components/MemberProfile";
import { getSession } from "@/app/lib/auth";

const profile = async () => {
  const session = await getSession();
  const user = session?.resultObj;

  return (
    <div>
      <MemberProfile user={user} />
    </div>
  );
};

export default profile;
