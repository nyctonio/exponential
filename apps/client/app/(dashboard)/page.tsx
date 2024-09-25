const Index = () => {
  return (
    <div className="flex text-3xl text-[var(--primary-shade-b)] justify-center items-center w-full h-full">
      Exponential
      <span className="relative -mt-6 ml-2 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-shade-e)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary-shade-a)]"></span>
      </span>
    </div>
  );
};

export default Index;
