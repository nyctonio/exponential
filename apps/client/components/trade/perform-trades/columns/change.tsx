const Index = ({ ltp, close }: { ltp: string; close: string }) => {
  return (
    <div className="px-2 py-1 text-center">
      {(parseFloat(ltp) - parseFloat(close)).toFixed(2)}{' '}
    </div>
  );
};

export default Index;
