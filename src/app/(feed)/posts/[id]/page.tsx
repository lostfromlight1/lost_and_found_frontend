import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PostCard from "@/features/post/components/PostCard";
import { getPostById } from "@/features/post/server/getPostById";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
    const { id } = await params;
    const postId = Number(id);

    if (!Number.isFinite(postId) || postId <= 0) {
        notFound();
    }

    const post = await getPostById(postId);

    if (!post) {
        notFound();
    }

    return (
        <MainLayout>
            <div className="min-h-full bg-slate-100 py-4 sm:py-6">
                <div className="mx-auto w-full max-w-4xl px-3 sm:px-5">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <PostCard post={post} mode="detail" />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}