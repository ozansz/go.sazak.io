import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const debug = false

export default function OpengraphPage() {
    return (
      <div className={cn("h-[315px] w-[600px] flex flex-row align-center justify-center items-center mx-5", debug ? "border-red-500 border-2" : "")}>
          <img src="/assets/pp.jpeg" width={100} height={100} className="rounded-full" />
          <Separator orientation="vertical" className="mx-5 bg-gray-600 h-20" />
          <div>
            <div className="text-4xl">go.sazak.io</div>
            <Separator className="mt-4 mb-2 bg-gray-600" />
            <div className="text-lg text-muted-foreground">Sazak's Go Package Index</div>
          </div>
      </div>
    )
  }