import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NewsItem {
  _id: string;
  newsImage: string;
  newsTitle: string;
  createdAt: string | Date;
}

interface TipRanksLabsProps {
  rightSide: NewsItem;
  leftSide1: NewsItem;
  leftSide2: NewsItem;
}

export default function TipRanksLabs({
  rightSide,
  leftSide1,
  leftSide2,
}: TipRanksLabsProps) {
  return (
    <div className="w-full mb-8 container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Olive Stock Labs</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Article */}
        <div className="md:col-span-2 border rounded-xl pb-2">
          <Image
            src={rightSide?.newsImage}
            alt="Person looking at financial charts"
            width={800}
            height={600}
            className="w-full h-[543px] object-cover rounded-t-xl mb-2 bg-black"
          />
          <div className="text-xs text-gray-500 mb-1 px-2">
            Olive Stock News
          </div>
          <h3 className="text-sm font-medium mb-2 px-2">
            {rightSide?.newsTitle}
          </h3>
          <hr className="my-3 px-3" />
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-gray-500">
              {new Date(rightSide?.createdAt).toLocaleDateString()}
            </span>
            <Link href={`/news/${rightSide?._id}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7 px-3"
              >
                READ
              </Button>
            </Link>
          </div>
        </div>

        {/* Smaller Articles */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col border pb-3 rounded-md">
            <Image
              src={leftSide1?.newsImage}
              alt="Financial chart"
              width={300}
              height={200}
              className="w-full h-[196px] object-cover rounded-t-md mb-2 bg-teal-900"
            />
            <div className="text-xs text-gray-500 mb-1 px-2">
              Olive Stock News
            </div>
            <h3 className="text-sm font-medium mb-2 px-2">
              {leftSide1?.newsTitle}
            </h3>
            <div className="flex items-center justify-between mt-auto px-2">
              <span className="text-xs text-gray-500">
                {new Date(leftSide1?.createdAt).toLocaleDateString()}
              </span>
              <Link href={`/news/${leftSide1?._id}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-7 px-3"
                >
                  READ
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col border pb-3 rounded-md">
            <Image
              src={leftSide2?.newsImage}
              alt="Financial chart"
              width={300}
              height={200}
              className="w-full h-[196px] object-cover rounded-t-md mb-2 bg-teal-900"
            />
            <div className="text-xs text-gray-500 mb-1 px-2">
              Olive Stock News
            </div>
            <h3 className="text-sm font-medium mb-2 px-2">
              {leftSide2?.newsTitle}
            </h3>
            <div className="flex items-center justify-between mt-auto px-2">
              <span className="text-xs text-gray-500">
                {new Date(leftSide1?.createdAt).toLocaleDateString()}
              </span>
              <Link href={`/news/${leftSide2?._id}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-7 px-3"
                >
                  READ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
