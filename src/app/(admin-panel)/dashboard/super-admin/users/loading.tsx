import { DotLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <DotLoader color="#000" size={50} />
    </div>
  );
}
