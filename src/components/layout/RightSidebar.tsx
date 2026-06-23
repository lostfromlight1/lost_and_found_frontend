"use client";

import { useEffect } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import DateRangePickerForm from "@/components/form/DateRangePickerForm";
import { DateRange } from "react-day-picker";
import Link from "next/link";

const MYANMAR_CITIES = [
  { label: "Yangon", value: "YANGON" },
  { label: "Mandalay", value: "MANDALAY" },
  { label: "Naypyidaw", value: "NAYPYIDAW" },
  { label: "Taunggyi", value: "TAUNGGYI" },
  { label: "Mawlamyine", value: "MAWLAMYINE" },
  { label: "Bago", value: "BAGO" },
];

interface CategoryItem {
  id: number;
  name: string;
}

interface RightSidebarProps {
  type: string;
  setType: (val: "LOST" | "FOUND" | "ALL") => void;
  city: string;
  setCity: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  locationDetails: string;
  setLocationDetails: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  categoriesList: CategoryItem[];
}

export default function RightSidebar({
  type,
  setType,
  city,
  setCity,
  categoryId,
  setCategoryId,
  locationDetails,
  setLocationDetails,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categoriesList,
}: RightSidebarProps) {
  const form = useForm<{ dateRange: DateRange | undefined }>({
    defaultValues: {
      dateRange:
        startDate || endDate
          ? {
            from: startDate ? new Date(startDate) : undefined,
            to: endDate ? new Date(endDate) : undefined,
          }
          : undefined,
    },
  });

  const dateRange = useWatch({
    control: form.control,
    name: "dateRange",
  });

  useEffect(() => {
    const formatToYMD = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const newStart = dateRange?.from ? formatToYMD(dateRange.from) : "";
    const newEnd = dateRange?.to ? formatToYMD(dateRange.to) : "";

    if (newStart !== startDate) setStartDate(newStart);
    if (newEnd !== endDate) setEndDate(newEnd);
  }, [dateRange, startDate, endDate, setStartDate, setEndDate]);

  return (
    // FIXED: Added sticky, h-screen, and overflow-y-auto 
    <div className="sticky top-0 h-screen w-full overflow-y-auto px-3 py-5 xl:px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="rounded-[24px] border border-[#b7cfb2] bg-[#edf5eb]/95 p-5 shadow-[0_10px_28px_rgba(42,63,63,0.07)] backdrop-blur-sm xl:p-6">
        <div className="mb-5">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d857d] transition-colors group-focus-within:text-[#2a3f3f]" />
            <Input
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="Search location"
              className="h-12 w-full rounded-[16px] border-[#bfd0c3] bg-white/80 pl-11 text-[14px] font-medium text-[#2a3f3f] placeholder:text-[#7d938a] focus-visible:ring-2 focus-visible:ring-[#89c07e]"
            />
          </div>
        </div>

        <div className="rounded-[20px] border border-[#c6d7c8] bg-[#f7fbf7] p-4">
          <h2 className="mb-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#70877f]">
            Filter notes
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#5f756d]">
                Post Type
              </span>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType((value ?? "ALL") as "LOST" | "FOUND" | "ALL")
                }
              >
                {/* FIXED: Added w-full */}
                <SelectTrigger className="h-11 w-full rounded-[14px] border-[#bfd0c3] bg-white text-[13px] font-bold text-[#2a3f3f] shadow-none">
                  <SelectValue placeholder="All Post Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Post Types</SelectItem>
                  <SelectItem value="LOST">Lost Items</SelectItem>
                  <SelectItem value="FOUND">Found Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#5f756d]">
                Category
              </span>
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value ?? "ALL")}
              >
                {/* FIXED: Added w-full */}
                <SelectTrigger className="h-11 w-full rounded-[14px] border-[#bfd0c3] bg-white text-[13px] font-bold text-[#2a3f3f] shadow-none">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categoriesList?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#5f756d]">
                City
              </span>
              <Select
                value={city}
                onValueChange={(value) => setCity(value ?? "ALL")}
              >
                {/* FIXED: Added w-full */}
                <SelectTrigger className="h-11 w-full rounded-[14px] border-[#bfd0c3] bg-white text-[13px] font-bold text-[#2a3f3f] shadow-none">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Cities</SelectItem>
                  {MYANMAR_CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#5f756d]">
                Date Range
              </span>
              <Form {...form}>
                <DateRangePickerForm
                  control={form.control}
                  name="dateRange"
                  placeholder="Anytime"
                  buttonClassName="w-full h-11 rounded-[14px] border border-[#bfd0c3] bg-white px-3 text-[13px] font-bold text-[#2a3f3f] shadow-none"
                />
              </Form>

              <button
                onClick={() => {
                  form.setValue("dateRange", undefined);
                  setStartDate("");
                  setEndDate("");
                }}
                className="mt-1 w-fit text-[11px] font-bold text-[#5f756d] underline underline-offset-2 transition hover:text-[#2a3f3f]"
              >
                Reset dates
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#c5d6c8] pt-8">
          <h2 className="mb-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#70877f]">
            Guidelines
          </h2>

          <ul className="flex flex-col gap-5 text-[14px] leading-7 text-[#567067]">
            <li className="flex items-start gap-4">
              <span className="pt-0.5 text-[20px] font-bold text-[#9bb79b]">
                01
              </span>
              <span>
                <strong className="text-[#2a3f3f]">Be descriptive.</strong>{" "}
                Withhold one unique identifying feature to verify the true
                owner.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="pt-0.5 text-[20px] font-bold text-[#9bb79b]">
                02
              </span>
              <span>
                <strong className="text-[#2a3f3f]">Protect privacy.</strong>{" "}
                Never publicly share full ID numbers or financial details.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="pt-0.5 text-[20px] font-bold text-[#9bb79b]">
                03
              </span>
              <span>
                <strong className="text-[#2a3f3f]">Meet safely.</strong>{" "}
                Arrange handovers in well-lit, public spaces during daylight.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="pt-0.5 text-[20px] font-bold text-[#9bb79b]">
                04
              </span>
              <span>
                <strong className="text-[#2a3f3f]">Verify ownership.</strong>{" "}
                Ask for proof before returning the item.
              </span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#728a81]">
            <Link href="/help" className="transition hover:text-[#2a3f3f]">
              Help
            </Link>
            <Link href="/privacy" className="transition hover:text-[#2a3f3f]">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-[#2a3f3f]">
              Terms
            </Link>
            <Link href="/about" className="transition hover:text-[#2a3f3f]">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}