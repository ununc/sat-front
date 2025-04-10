import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as { [key: string]: string };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">오류가 발생했습니다</h1>
      <p className="mb-2">죄송합니다, 예상치 못한 오류가 발생했습니다.</p>
      <p className="text-red-500">
        {error?.statusText || error?.message || "알 수 없는 오류"}
      </p>
    </div>
  );
}
