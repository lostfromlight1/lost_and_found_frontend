import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";
import { PostResponseDto } from "@/features/post/api/response/posts.response";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export async function getPostById(id: number): Promise<PostResponseDto | null> {
    try {
        const session = await getServerSession(authOptions);

        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                ...(process.env.NEXT_PUBLIC_API_KEY
                    ? { "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY }
                    : {}),
                ...(session?.accessToken
                    ? { Authorization: `Bearer ${session.accessToken}` }
                    : {}),
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch post:", res.status, res.statusText);
            return null;
        }

        const json = await res.json();

        return json?.data ?? json;
    } catch (error) {
        console.error("getPostById error:", error);
        return null;
    }
}