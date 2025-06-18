"use client";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";

interface PageProps {
  params: { id: string };
}

const Page = ({ params }: PageProps) => {
  const axiosInstance = useAxios();

  const { data: newsDetails = {}, isLoading } = useQuery({
    queryKey: ["blog-details"],
    queryFn: async () => {
      const res = await axiosInstance(`/admin/news/${params?.id}`);
      return res.data.data;
    },
  });

  console.log(params)
  console.log(newsDetails);

  const { newsTitle, newsDescription } = newsDetails;

  if (isLoading) return <div>Loading......</div>;

  return (
    <div>
      <h1>{newsTitle}</h1>
      <div className="max-w-article mx-auto bg-red-100">
        <div
          className="quill-content text-gray-700 max-w-none"
          dangerouslySetInnerHTML={{ __html: newsDescription }}
        />
      </div>
    </div>
  );
};

export default Page;
