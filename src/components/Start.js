import React from "react";

function Start({ onStart }) {
  return (
    <div className="flex flex-col text-center place-items-center">
      <div className="mt-40 mb-24">
        <p className="text-9xl font-bloodlust animate-jump-in animate-duration-[2000ms] animate-delay-[1000ms]">Kill them all!</p>
      </div>
      <div
        className="flex bg-blue-500 text-slate-50 h-16 w-40 text-4xl text-center justify-center rounded-lg hover:bg-slate-50 hover:text-blue-500 hover:border-2 hover:border-blue-500 hover:transition-colors animate-delay-[3000ms] animate-fade"
        onClick={onStart}
      >
        <button>Start</button>
      </div>
    </div>
  );
}

export default Start;
