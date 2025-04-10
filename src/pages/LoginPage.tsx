import { useState } from "react";
import { requestLogin } from "@/apis/auth/login";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const validateForm = () => {
    const newErrors = { id: "", password: "" };
    let isValid = true;

    if (!id.trim()) {
      newErrors.id = "아이디를 입력해주세요";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const data = await requestLogin({
        id,
        password,
        keepLogin: false,
      });
      setAuth(data);
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        setLoginError(error?.response?.data?.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <div className="flex justify-center items-center">학원 로고</div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                aria-describedby="id-error"
                className={errors.id ? "border-red-500" : ""}
              />
              {errors.id && (
                <p id="id-error" className="text-sm text-red-500 mt-1">
                  {errors.id}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-error"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500 mt-1">
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="mt-8">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
