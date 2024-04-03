import { getSession } from "@/lib/auth";
import { getAllPosts, getWaivers } from "@/app/actions";
//components
import Waiver from "@/components/Waiver";
import MemberDashboard from "@/components/MemberDashboard";

const MemberDash = async () => {
  const session = await getSession();
  const user = session?.resultObj;
  const posts = await getAllPosts();
  const waivers = await getWaivers();

  const hasWaiver = waivers.some((waiver) => waiver.memberId === user._id);

  return (
    <>
      {hasWaiver ? <MemberDashboard user={user} posts={posts} /> : <Waiver />}
    </>
  );
};

export default MemberDash;
