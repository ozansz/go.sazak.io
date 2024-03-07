const repos = require('@/repos.json')

import { Separator } from '@/components/ui/separator'
import Link from 'next/link';

export async function getStaticPaths() {
    return {
        paths: repos.map(repo => ({ params: { slug: repo.go_package } })),
        fallback: false
  }
}

export default function RepoSlug({ params }) {
  const { slug } = params

  return (
    <div className="h-full flex flex-row align-center justify-center items-center mx-5">
        <div className="text-4xl">👋</div>
        <Separator orientation="vertical" className="mx-5 bg-white h-8" />
        <div className="text-lg font-light">Please refer to <Link className="underline-offset-4 underline" href={`https://pkg.go.dev/go.sazak.io/${slug}`} target="_blank">{`pkg.go.dev/go.sazak.io/${slug}`}</Link></div>
    </div>
  )
}

export async function generateMetadata({ params }) {
    const { slug } = params

    const repo = repos.find(repo => repo.go_package === slug)

    if (!repo) {
      throw new Error(`Repo with Go pacakge name (slug) not found in generateMetadata: ${slug}`)
    }

    return {
        other: {
            'go-import': "go.sazak.io/"+slug+" git https://github.com/"+repo.owner+"/"+repo.name,
            'go-source': "go.sazak.io/"+slug+" https://github.com/"+repo.owner+"/"+repo.name+" https://github.com/"+repo.owner+"/"+repo.name+"/tree/"+repo.master_branch+"{/dir} https://github.com/"+repo.owner+"/"+repo.name+"/tree/"+repo.master_branch+"{/dir}/{file}#L{line}",
        }
    }
}