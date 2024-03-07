import { Separator } from "@/components/ui/separator";

export default function OpengraphPage() {
    return (
      <div className="h-[315px] w-[600px] flex flex-row align-center justify-center items-center mx-5">
          <img src="/assets/pp.jpeg" width={50} height={50} className="rounded-full" />
          <Separator orientation="vertical" className="mx-5 bg-gray-500 h-12" />
          <div>
            <div className="text-3xl">go.sazak.io</div>
            <Separator className="my-2 bg-gray-500" />
            <div className="text-sm text-muted-foreground">Sazak's Go Package Index</div>
          </div>
      </div>
    )
  }