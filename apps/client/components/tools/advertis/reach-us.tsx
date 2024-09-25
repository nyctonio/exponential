import React from 'react';

const Reach = () => {
  return (
    <div className="md:ml-2 bg-white h-[26rem] ">
      <h2 className="h-9 text-base pl-5 py-1 text-white bg-[var(--primary-shade-b)] flex items-center">
        Reach Us
      </h2>
      <div className="text-sm space-y-5 py-5 overflow-auto">
        <div className="flex flex-row justify-around ">
          <p className="w-20">Email</p>
          <p className="w-[60%] ">contactus@example.com</p>
        </div>
        <div className="flex flex-row justify-around">
          <p className="w-20">Phone</p>
          <p className="w-[60%]">+1 102 345 6789</p>
        </div>
        <div className="flex flex-row justify-around">
          <p className="w-20">Address</p>
          <p className="w-[60%]">
            #212, Ground Floor,7th Cross Some Layout, Some
            Road,Koromangla,Bengaluru 560001
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reach;
