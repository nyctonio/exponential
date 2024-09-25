const Index = ({ expiry }: { expiry: string }) => {
  return (
    <div className="px-2 py-1 w-full text-center itali space-x-1 font-light">
      <span>{expiry}</span>
    </div>
  );
};

export default Index;
