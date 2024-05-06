"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const MembersSection = ({ members, user }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (user?.memberType === "member") {
    let sortedMembers = [...members]
      .filter(
        (member) =>
          member.memberType === "member" ||
          member.memberType === "supershark" ||
          member.memberType === "ultrashark"
      )
      .sort((a, b) => a.firstName.localeCompare(b.firstName));

    // Pagination
    const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
    const membersOnPage = sortedMembers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div className="mx-auto text-center px-4">
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 py-1 rounded ${
                currentPage === page ? "letter-btn" : "letter-btn-1"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {membersOnPage.map((member, index) => (
            <div
              key={index}
              className="w-64 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 overflow-auto"
            >
              <div className="w-full h-48 relative rounded-t-lg overflow-hidden">
                <Image
                  className="object-cover absolute inset-0"
                  src={
                    member.profilePic?.status === "approved" &&
                    member.profilePic?.url
                      ? member.profilePic.url
                      : "/images/sandsharks-icon2.svg"
                  }
                  alt="profile photo"
                  fill={true}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 break-words text-sm">
                <h5 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {member?.firstName}
                </h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                  {member?.pronouns}
                </p>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                  {member?.about}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 py-1 rounded ${
                currentPage === page ? "letter-btn" : "letter-btn-1"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl text-red-500">
          Your current status is pending; you must be an approved member to view
          this section.
        </h1>
        <h1 className="text-2xl text-red-500">Check back later :)</h1>
      </div>
    );
  }
};

export default MembersSection;
