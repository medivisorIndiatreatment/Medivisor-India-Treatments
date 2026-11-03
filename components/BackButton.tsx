'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Button } from "./ui/button";

export function BackButton() {
    const router = useRouter();
    const { dir } = useLang();
    const isRtl = dir === "rtl";
    const Icon = isRtl ? ArrowRight : ArrowLeft;

    return (
        <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="border-gray-200 rounded-xs description-1 hover:bg-gray-50  bg-white"
        >
            <Icon className="h-5 w-5 me-2" />
             Back
        </Button>
    );
}