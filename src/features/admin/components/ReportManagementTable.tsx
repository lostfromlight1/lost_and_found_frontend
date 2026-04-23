"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Search, Undo2 } from "lucide-react"; 
import AppTable, { TableColumn } from "@/components/AppTable"; 
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useReports, useResolveReport, useRejectReport, useRestoreReport } from "@/features/reports/hooks/useReports";
import { ReportResponseDto } from "@/features/reports/api/response/reports.response";
import ReviewReportModal from "@/features/reports/components/ReviewReportModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import ConfirmationDialog from "@/components/model/ConfirmationDialog";

export default function ReportManagementTable() {
  const [page] = useState(0); 
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  
  // Modal States
  const [reviewReport, setReviewReport] = useState<ReportResponseDto | null>(null);
  const [resolvingReport, setResolvingReport] = useState<{ id: number, type: string } | null>(null);
  const [rejectingReport, setRejectingReport] = useState<{ id: number } | null>(null);
  const [restoringReport, setRestoringReport] = useState<{ id: number, type: string } | null>(null);
  
  const { data: pageData, isLoading } = useReports({ 
    page, 
    size, 
    status: statusFilter === "ALL" ? undefined : statusFilter 
  });
  
  const reports = pageData?.content || [];

  const { mutate: resolveReport, isPending: isResolving } = useResolveReport();
  const { mutate: rejectReport, isPending: isRejecting } = useRejectReport();
  const { mutate: restoreReport, isPending: isRestoring } = useRestoreReport(); 

  const executeResolve = () => {
    if (!resolvingReport) return;
    resolveReport(
      { id: resolvingReport.id, data: { adminNote: "Violation confirmed. Content removed." } }, 
      { 
        onSuccess: () => {
          setResolvingReport(null);
          setReviewReport(null);
        }
      }
    );
  };

  const executeReject = () => {
    if (!rejectingReport) return;
    rejectReport(
      { id: rejectingReport.id, data: { adminNote: "No violation found. Report dismissed." } }, 
      { 
        onSuccess: () => {
          setRejectingReport(null);
          setReviewReport(null);
        }
      }
    );
  };

  const executeRestore = () => {
    if (!restoringReport) return;
    restoreReport(restoringReport.id, {
      onSuccess: () => {
        setRestoringReport(null);
        setReviewReport(null);
      }
    });
  };

  const columns: TableColumn<ReportResponseDto>[] = [
    { key: "id", header: "ID", width: 80 },
    { 
      key: "targetType", 
      header: "Target",
      render: (_, row) => (
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800">{row.targetType} #{row.targetId}</span>
          <span className="text-[11px] text-slate-500">By: {row.reportedByName}</span>
        </div>
      )
    },
    { 
      key: "reason", 
      header: "Reason",
      render: (_, row) => (
        <div className="text-left">
          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
            {row.reason}
          </span>
        </div>
      )
    },
    { 
      key: "description", 
      header: "Details", 
      className: "max-w-[200px] truncate text-sm text-left",
      render: (val) => val ? String(val) : <span className="text-slate-400 italic">None</span>
    },
    { 
      key: "status", 
      header: "Status",
      render: (val) => (
        <div className="text-left">
          <span className={cn(
            "px-2 py-1 rounded-full text-[10px] font-bold",
            val === "PENDING" ? "bg-yellow-100 text-yellow-700" : 
            val === "RESOLVED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          )}>
            {String(val)}
          </span>
        </div>
      )
    },
    { 
      key: "createdAt", 
      header: "Date", 
      render: (val) => <span className="text-xs text-left">{format(new Date(String(val)), "MMM d, yyyy")}</span>
    },
    {
      key: "actions",
      header: "Actions",
      width: 160,
      className: "text-center", // <--- Centers the column header
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end"> {/* <--- Keeps the icons aligned to the right */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setReviewReport(row)}
            title="Review Content"
          >
            <Search size={16} />
          </Button>

          {/* Show Approve/Reject ONLY if PENDING */}
          {row.status === "PENDING" && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setResolvingReport({ id: row.id, type: row.targetType })}
                disabled={isResolving || isRejecting || isRestoring}
                title="Approve Report & Delete Content"
              >
                <CheckCircle size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => setRejectingReport({ id: row.id })}
                disabled={isResolving || isRejecting || isRestoring}
                title="Dismiss Report (Safe)"
              >
                <XCircle size={16} />
              </Button>
            </>
          )}

          {/* Show Undo/Restore ONLY if RESOLVED (Content was deleted) */}
          {row.status === "RESOLVED" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => setRestoringReport({ id: row.id, type: row.targetType })}
              disabled={isResolving || isRejecting || isRestoring}
              title="Undo Deletion & Restore Content"
            >
              <Undo2 size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderFilter = (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600">Filter by Status:</span>
      <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "PENDING")}>
        <SelectTrigger className="w-[180px] bg-white border-slate-200">
          <SelectValue placeholder="Filter..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending Action</SelectItem>
          <SelectItem value="RESOLVED">Deleted (Resolved)</SelectItem>
          <SelectItem value="REJECTED">Safe (Rejected)</SelectItem>
          <SelectItem value="ALL">Show All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <AppTable<ReportResponseDto>
        columns={columns}
        data={reports}
        loading={isLoading}
        customFilters={renderFilter}
      />

      {/* Review Content Modal */}
      <ReviewReportModal 
        report={reviewReport} 
        onClose={() => setReviewReport(null)} 
      />

      {/* Action Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={!!resolvingReport}
        onOpenChange={(open) => !open && setResolvingReport(null)}
        onConfirm={executeResolve}
        title="Approve Report & Delete Content"
        description={`Are you sure you want to approve this report? This will permanently delete the ${resolvingReport?.type?.toLowerCase()}.`}
        confirmLabel="Approve & Delete"
      />

      <ConfirmationDialog
        open={!!rejectingReport}
        onOpenChange={(open) => !open && setRejectingReport(null)}
        onConfirm={executeReject}
        title="Dismiss Report"
        description="Are you sure you want to dismiss this report? The reported content will remain visible and safe."
        confirmLabel="Dismiss Report"
      />

      <ConfirmationDialog
        open={!!restoringReport}
        onOpenChange={(open) => !open && setRestoringReport(null)}
        onConfirm={executeRestore}
        title="Restore Content"
        description={`Are you sure you want to undo this action? The ${restoringReport?.type?.toLowerCase()} will be un-deleted and become visible to users again.`}
        confirmLabel="Restore Content"
      />
    </div>
  );
}
