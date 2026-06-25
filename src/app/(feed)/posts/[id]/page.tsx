import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { getPostById } from "@/features/post/server/getPostById";
import PostDetailView from "@/features/post/components/PostDetailView"; 

type PageProps = {
    params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

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
            <div className="min-h-screen bg-slate-50/50 py-6 sm:py-10">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <PostDetailView post={post} />
                </div>
            </div>
        </MainLayout>
    );
}