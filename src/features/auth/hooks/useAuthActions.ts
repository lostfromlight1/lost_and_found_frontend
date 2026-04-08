import { useMutation } from "@tanstack/react-query";
import { signIn, SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginRequest } from "../type/auth-types";

export function useAuthActions() {
  const router = useRouter();

  const loginMutation = useMutation<SignInResponse | undefined, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Successfully logged in!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    loginAction: loginMutation.mutate,
    isPending: loginMutation.isPending,
  };
}
