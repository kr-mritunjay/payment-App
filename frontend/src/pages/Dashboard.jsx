import React from "react";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/User";
export function Dashboard() {
  return (
    <div className=" bg-slate-300 h-screen flex justify-center ">
      <div className="rounded-lg bg-white w-3/6 text-center p-2 h-auto px-4">
        <Appbar />
        <div className="m-8">
          <Balance value={"10,000"} />
          <Users />
        </div>
      </div>
    </div>
  );
}
