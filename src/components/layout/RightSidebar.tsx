"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import DateRangePickerForm from "@/components/form/DateRangePickerForm";
import { DateRange } from "react-day-picker";

// --- IMPORT COMPONENT & TYPE EXTRACTION ---
import SupportModal, { ModalType } from "@/components/SupportModal"; // Adjust path if needed

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

type SidebarFormValues = {
  dateRange: DateRange | undefined;
};

const parseYMDToLocalDate = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const formatToYMD = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

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

  // --- MODAL STATE MANAGEMENT ---
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = (type: Exclude<ModalType, null>) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const currentDateRange = useMemo<DateRange | undefined>(() => {
    if (!startDate && !endDate) return undefined;

    return {
      from: parseYMDToLocalDate(startDate),
      to: parseYMDToLocalDate(endDate),
    };
  }, [startDate, endDate]);

  const form = useForm<SidebarFormValues>({
    values: {
      dateRange: currentDateRange,
    },
  });

  return (
    <div className="flex flex-col w-full lg:w-[320px] xl:w-[350px] h-full pt-8 pb-6 px-6 xl:px-8 border-l border-transparent lg:border-slate-200 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="mb-8 shrink-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          </div>
          <Input
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            className="block w-full pl-6 pr-0 py-2 bg-transparent border-none border-b border-slate-200 rounded-none text-[14px] focus-visible:ring-0 focus-visible:border-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-none font-medium"
            placeholder="Search Location"
          />
        </div>
      </div>

      <div className="mb-10 shrink-0 bg-white border border-slate-200 rounded-lg p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <h2 className="font-black text-[13px] text-slate-900 uppercase tracking-widest mb-6">
          Filter Feed
        </h2>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
              Post Type
            </span>
            <Select
              value={type}
              onValueChange={(val) => setType((val as "LOST" | "FOUND" | "ALL") || "ALL")}
            >
              <SelectTrigger className="w-full bg-slate-50 rounded-md h-10 px-3 border border-slate-200 hover:border-slate-400 hover:bg-white focus:ring-0 text-slate-800 font-bold text-[13px] transition-all">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-medium">
                  All Types
                </SelectItem>
                <SelectItem value="LOST" className="font-medium text-destructive">
                  Lost Items
                </SelectItem>
                <SelectItem value="FOUND" className="font-medium text-emerald-600">
                  Found Items
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
              Category
            </span>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "ALL")}>
              <SelectTrigger className="w-full bg-slate-50 rounded-md h-10 px-3 border border-slate-200 hover:border-slate-400 hover:bg-white focus:ring-0 text-slate-800 font-bold text-[13px] transition-all">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-medium">
                  All Categories
                </SelectItem>
                {categoriesList?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)} className="font-medium">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
              City
            </span>
            <Select value={city} onValueChange={(val) => setCity(val || "ALL")}>
              <SelectTrigger className="w-full bg-slate-50 rounded-md h-10 px-3 border border-slate-200 hover:border-slate-400 hover:bg-white focus:ring-0 text-slate-800 font-bold text-[13px] transition-all">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-medium">
                  All Cities
                </SelectItem>
                {MYANMAR_CITIES?.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="font-medium">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
              Date Range
            </span>
            <Form {...form}>
              <form>
                <DateRangePickerForm
                  control={form.control}
                  name="dateRange"
                  value={currentDateRange}
                  onChange={(range) => {
                    const typedRange = range as DateRange | undefined;
                    setStartDate(formatToYMD(typedRange?.from));
                    setEndDate(formatToYMD(typedRange?.to));
                  }}
                  placeholder="Anytime"
                  buttonClassName="w-full bg-slate-50 rounded-md h-10 px-3 border border-slate-200 hover:border-slate-400 hover:bg-white text-slate-800 font-bold text-[13px] shadow-none focus:ring-0 transition-all"
                />
              </form>
            </Form>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-bold self-start transition-colors mt-1 underline underline-offset-2"
                type="button"
              >
                Reset dates
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-300 shrink-0">
        <h2 className="font-black text-[13px] text-slate-900 uppercase tracking-widest mb-6">
          Guidelines
        </h2>
        <ul className="flex flex-col gap-6 text-[14px] text-slate-600 font-serif">
          <li className="flex items-start gap-4">
            <span className="text-slate-300 font-serif text-lg font-bold">01</span>
            <span className="leading-relaxed">
              <strong className="text-slate-900">Be descriptive.</strong> Withhold one unique identifying feature to verify the true owner.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <span className="text-slate-300 font-serif text-lg font-bold">02</span>
            <span className="leading-relaxed">
              <strong className="text-slate-900">Protect privacy.</strong> Never publicly share full ID numbers or financial details.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <span className="text-slate-300 font-serif text-lg font-bold">03</span>
            <span className="leading-relaxed">
              <strong className="text-slate-900">Meet safely.</strong> Arrange handovers in well-lit, public spaces during daylight.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <span className="text-slate-300 font-serif text-lg font-bold">04</span>
            <span className="leading-relaxed">
              <strong className="text-slate-900">Verify ownership.</strong> Ask for proof (receipts or matching details) before returning.
            </span>
          </li>
        </ul>

        {/* MODAL LINKS CONVERTED TO NATIVE INTERACTIVE BUTTONS */}
        <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
          <button onClick={() => openModal("contact")} className="hover:text-slate-900 hover:underline transition-all text-blue-500 cursor-pointer">
            Help & Support
          </button>
          <button onClick={() => openModal("privacy")} className="hover:text-slate-900 hover:underline transition-all cursor-pointer">
            Privacy
          </button>
          <button onClick={() => openModal("terms")} className="hover:text-slate-900 hover:underline transition-all cursor-pointer">
            Terms
          </button>
          <button onClick={() => openModal("about")} className="hover:text-slate-900 hover:underline transition-all cursor-pointer">
            About
          </button>
        </div>
      </div>

      {/* --- RENDER MODAL INSIDE COMPONENT CONTEXT --- */}
      <SupportModal isOpen={isModalOpen} modalType={modalType} onClose={closeModal} />
    </div>
  );
}