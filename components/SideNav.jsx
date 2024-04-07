import Link from "next/link";

const SideNav = () => {
  return (
    <div>
      <Link href="/dashboard/member/league-history">
        <div className="p-6 hover:bg-gray-200 bg-orange-200 border-b border-red-600">
          <h1 className="cursor-pointer">
            Learn more about the history of Sandsharks
          </h1>
        </div>
      </Link>
      <Link href="/dashboard/member/rules">
        <div className="p-6 hover:bg-gray-200 bg-orange-200 border-b border-red-600">
          <h1 className="cursor-pointer">Learn the rules of the game</h1>
        </div>
      </Link>
      <Link href="/dashboard/member/members">
        <div className="p-6 hover:bg-gray-200 bg-orange-200 border-b border-red-600">
          <h1 className="cursor-pointer">Get to know our members</h1>
        </div>
      </Link>
      <Link href="/dashboard/member/profile">
        <div className="p-6 hover:bg-gray-200 bg-orange-200">
          <h1 className="cursor-pointer">
            Update your profile - tell us about yourself :)
          </h1>
        </div>
      </Link>
    </div>
  );
};

export default SideNav;
