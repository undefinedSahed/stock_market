import Image from "next/image";

interface MarketNewsCardProps {
  image: string;
  title: string;
  category?: string;
  timeAgo: string;
  tags: Array<{
    name: string;
    color?: string;
  }>;
  showBannerAd?: boolean;
}

export default function MarketNewsCard({
  category,
  image,
  title,
  timeAgo,
  tags,
}: MarketNewsCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative">
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="aspect-5/3 w-full object-cover "
        />
      </div>
      <div className="p-4">
        <div className="text-sm font-medium text-gray-500">{category}</div>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">{timeAgo}</span>
          <div className="flex gap-2">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full border border-green-500 px-3 py-0.5 text-xs font-medium text-green-600"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
