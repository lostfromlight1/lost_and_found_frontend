import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "../type/auth-types";

export function useAuthActions() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      return result;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      // Toast notification is already handled globally or you can add it here
      console.error(error.message);
    },
  });

  return {
    loginAction: loginMutation.mutate,
    isPending: loginMutation.isPending,
  };
}
