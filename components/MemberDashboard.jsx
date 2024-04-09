import Posts from "./Posts";
import SideNav from "./SideNav";

const MemberDashboard = ({ user, posts }) => {
  const { firstName, preferredName } = user;

  return (
    <div className="w-full sm:w-1/2 lg:w-3/4 mx-auto">
      <h2 className="mb-8 text-3xl font-bold">
        Hi {preferredName || firstName}!
      </h2>
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 w-full items-start">
        <div className="w-full lg:w-2/3 order-2 lg:order-1">
          <Posts posts={posts} user={user} />
        </div>
        <div className="w-full lg:w-1/3 order-1 lg:order-2">
          <SideNav />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
