"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";
import PostCard from "@/features/post/components/PostCard";
import CommentCard from "@/features/comments/components/CommentCard";
import { ReportResponseDto } from "@/features/reports/api/response/reports.response";

// Import your brand new services!
import { getPostByIdService } from "@/features/post/services/posts.service";
import { getCommentByIdService } from "@/features/comments/services/comments.service";

interface Props {
  report: ReportResponseDto | null;
  onClose: () => void;
}

export default function ReviewReportModal({ report, onClose }: Props) {
  const { data: session } = useSession();

  // Dynamically fetch the Post or Comment based on the report's targetType and targetId
  const { data, isLoading, isError } = useQuery({
    queryKey: ["review-content", report?.targetType, report?.targetId],
    queryFn: async () => {
      if (!report) return null;
      if (report.targetType === "POST") {
        return await getPostByIdService(report.targetId);
      }
      if (report.targetType === "COMMENT") {
        return await getCommentByIdService(report.targetId);
      }
      return null;
    },
    enabled: !!report && (report.targetType === "POST" || report.targetType === "COMMENT"),
    retry: 1, // Only retry once so we fail fast if it's already deleted
  });

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-slate-50/50">
        <DialogHeader className="p-5 bg-white border-b sticky top-0 z-50">
          <DialogTitle className="text-xl">
            Reviewing {report?.targetType} #{report?.targetId}
          </DialogTitle>
          <DialogDescription>
            Reported for <strong className="text-orange-600">{report?.reason}</strong> by {report?.reportedByName}
          </DialogDescription>
        </DialogHeader>

        {/* FIX: Swapped min-h-[300px] to min-h-75 */}
        <div className="p-6 flex flex-col items-center justify-start min-h-75">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center mt-12 text-slate-400 gap-3">
              <Loader2 className="animate-spin w-8 h-8" />
              <p>Fetching reported content...</p>
            </div>
          )}

          {/* Error / Not Found State (Content likely deleted) */}
          {isError && (
            <div className="flex flex-col items-center justify-center mt-12 text-red-500 gap-3 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
              <AlertCircle className="w-10 h-10" />
              <div>
                <h4 className="font-bold text-lg">Content Not Found</h4>
                <p className="text-sm mt-1">This {report?.targetType.toLowerCase()} may have already been deleted by the user or another admin.</p>
              </div>
            </div>
          )}

          {/* Render Post */}
          {data && report?.targetType === "POST" && (
            <div className="w-full">
              {/* @ts-expect-error - Expected due to discriminated union on data fetching */}
              <PostCard post={data} />
            </div>
          )}

          {/* Render Comment */}
          {data && report?.targetType === "COMMENT" && (
            <div className="w-full bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              {/* @ts-expect-error - Expected due to discriminated union on data fetching */}
              <CommentCard comment={data} postId={data.postId || 0} currentUser={session?.user} />
            </div>
          )}

          {/* Handle USER reports gracefully */}
          {report?.targetType === "USER" && (
            <div className="flex flex-col items-center justify-center mt-12 text-slate-600 gap-3">
              <p>User profile review modal is under construction.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
