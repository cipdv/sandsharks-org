import MemberProfile from "@/components/MemberProfile";
import { getCurrentUser } from "@/app/_actions";
import Link from "next/link";

const profile = async () => {
  const user = await getCurrentUser();

  return (
    <div>
      <MemberProfile user={user} />
    </div>
  );
};

export default profile;
