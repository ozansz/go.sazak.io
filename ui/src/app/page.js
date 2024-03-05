"use client"

const repos = require('@/repos.json')

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

import { Clipboard } from 'lucide-react'
import Link from "next/link"
import { toast } from "sonner"

export default function Home() {
  repos.sort((a, b) => b.stars - a.stars)

  return (
    <div className="flex flex-col w-[80%] mx-[10%] mb-10">
      <div className="flex flex-col mx-4 mt-16 mb-12">
        <h1 className="text-3xl">go.sazak.io</h1>
        <h2 className="text-sm mt-1 text-muted-foreground">Sazak's Go Package Index</h2>
      </div>
      <div className="flex flex-row flex-wrap justify-start align-center">
        {repos.map((repo, index) => (
          <Card key={index} className="w-[350px] m-4 flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{repo.owner}/{repo.name}</CardTitle>
              <CardDescription>{repo.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Clone</Label>
              <div className="flex flex-row items-center justify-between rounded-md border p-2 mt-2 text-sm text-muted-foreground">
                <span className="overflow-auto px-2 py-2 whitespace-nowrap">{`github.com/${repo.owner}/${repo.name}.git`}</span>
                <Button
                  variant="outline" className="px-2"
                  onClick={() => 
                    toast("Copied to clipboard", {
                      description: "Run `git clone` in terminal to clone the repository."
                    })
                  }
                >
                  <Clipboard className="w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              {/* <Button variant="outline">Cancel</Button> */}
              <Link href={`https://github.com/${repo.owner}/${repo.name}`} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <GitHubLogoIcon className="mx-1" />
                  <span className="mx-1 font-light">Star</span>
                  <Separator orientation="vertical" className="ml-2 mr-3 bg-white" />
                  <span className="mx-1 font-light">{repo.stars}</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
